'use strict';

const _ = require('lodash');
const MailerModel = require('./mailer');
const config = require('../config');

class meeting {

    /**
     * @constructor
     *
     * @param  {String} channelId
     */
    constructor(channelId) {
        this.channelId = channelId;
        this.questions = [
            'What did you do yesterday?',
            'What are you going to do today?',
            'Did you encounter any problems?'
        ];
        this.answers = {};
    }

    setMembers(members) {
        this.participants = members;
    }


    /**
     * start - Starts a conversation
     *
     * @param  {Object} bot
     * @param  {String} message
     * @return {Promise}
     */
    start(bot, message) {
        let that = this;


        return new Promise((resolve, reject) => {
            bot.startConversation(message, (err, convo) => {
                _.forEach(that.participants, (participant) => {
                    convo.say('Hello @' + participant.name +
                        ', it is your turn now.');

                    that.answers[participant.id] = [];

                    _.forEach(that.questions, (question, index) => {
                        convo.ask(that.questions[index], (msg, convo) => {
                            that.answers[participant.id].push({
                                question: question,
                                answer: msg.text,
                                createdAt: Date.now()
                            });

                            convo.next();
                        });
                    });

                    convo.say('Thank you @' + participant.name);
                });

                convo.say('Meeting has ended.');

                convo.on('end', (convo) => {
                    resolve();
                });
            });
        });
    }
};


module.exports = meeting;
