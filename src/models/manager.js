'use strict';

const Meeting = require('./meeting');
const _ = require('lodash');
const config = require('../config');
const Channel = require('./channel');

class manager {

    /**
     * @constructor
     * @param  {Object} controller
     */
    constructor(controller) {
        this.meetings = {};
        this.controller = controller;
        this.bindEvents_();
    }


    /**
     * meetingExist - Check if a meeting is ongoing.
     *
     * @param  {String} channelId
     * @return {boolean}
     */
    meetingExist(channelId) {
        return this.meetings[channelId];
    }


    /**
     * create - Creates a meeting.
     *
     * @param  {String} channelId
     * @return {Meeting}
     */
    create(channelId) {
        let meeting = new Meeting(channelId);
        this.meetings[channelId] = meeting;
        return meeting;
    }


    /**
     * destroy - Destroys an existing meeting.
     *
     * @param  {String} channelId
     */
    destroy(channelId) {
        delete this.meetings[channelId];
    }

    /**
     * @private
     *
     * bindEvents_ - Bind interval events.
     */
    bindEvents_() {
        let that = this;

        this.controller
            .hears(['start meeting'], 'ambient', (bot, message) => {
                let channelId = message.channel;

                if (that.meetingExist(channelId))
                    return bot.reply(message,
                        'Sorry, there is an existing meeting in this channel');

                let meeting = that.create(channelId);
                let channel = new Channel(that.controller);

                channel
                    .getMembers(channelId)
                    .then((members) => {
                        meeting.setMembers(members);

                        return meeting.start(bot, message);
                    })
                    .then(() => {
                        that.destroy(channelId);
                    })
                    .catch((err) => {
                        console.error('Error', err);
                    });
            });

        this.controller
            .hears(['status'], 'direct_mention', (bot, message) => {
                bot.reply(message, 'Active meetings are ' +
                    JSON.stringify(that.meetings));
            });

        this.controller
            .hears(['skip'], 'ambient', (bot, message) => {
                if (!that.meetingExist(message.channel)) return;

                let meeting = that.meetings[message.channel];

                meeting.getEventEmitter().emit('skip');
            });
    }
}


module.exports = manager;
