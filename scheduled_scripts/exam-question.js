const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const CronJob = require('cron').CronJob;
const fs = require('node:fs');
const util = require('node:util');

module.exports = {
    configFile: null,
    client: null,
    init: function(client, config) {
        this.client = client;
        this.configFile = config;
        this.questions();
        this.updateCorrect();
    },
    questions: async function() {
        let channel = this.client.channels.cache.find(ch => ch.name === this.configFile.exam_chan);
        var poolT = JSON.parse(fs.readFileSync('./resources/exams/technician.json', 'utf8'));
        var poolG = JSON.parse(fs.readFileSync('./resources/exams/general.json', 'utf8'));
        var poolE = JSON.parse(fs.readFileSync('./resources/exams/extra.json', 'utf8'));
        
        const job = new CronJob('0 0 6,18 * * *', async function() {
            try {
                var questions = JSON.parse(fs.readFileSync('./resources/exams/questions.json', 'utf8'));
                let oldT = await channel.messages.fetch(questions[questions.length - 1].idTech);
                let oldG = await channel.messages.fetch(questions[questions.length - 1].idGeneral);
                let oldE = await channel.messages.fetch(questions[questions.length - 1].idExtra);

                var questionT = '';
                for(var i = 0; i < oldT.embeds[0].fields.length; i++) {
                    if(oldT.embeds[0].fields[i].name == 'Question') {
                        questionT = oldT.embeds[0].fields[i].value.split(']')[0].split('[')[1];
                    }
                }
                var questionG = '';
                for(var i = 0; i < oldG.embeds[0].fields.length; i++) {
                    if(oldG.embeds[0].fields[i].name == 'Question') {
                        questionG = oldG.embeds[0].fields[i].value.split(']')[0].split('[')[1];
                    }
                }
                var questionE = '';
                for(var i = 0; i < oldE.embeds[0].fields.length; i++) {
                    if(oldE.embeds[0].fields[i].name == 'Question') {
                        questionE = oldE.embeds[0].fields[i].value.split(']')[0].split('[')[1];
                    }
                }

                var answerChoices = ['a', 'b', 'c', 'd']
                var answerCorrectT = '';
                var answerCorrectG = '';
                var answerCorrectE = '';
                for(var i = 0; i < poolT.length; i++) {
                    if(poolT[i].id == questionT) {
                        answerCorrectT = answerChoices[poolT[i].correct];
                    }
                }
                for(var i = 0; i < poolG.length; i++) {
                    if(poolG[i].id == questionG) {
                        answerCorrectG = answerChoices[poolG[i].correct];
                    }
                }
                for(var i = 0; i < poolE.length; i++) {
                    if(poolE[i].id == questionE) {
                        answerCorrectE = answerChoices[poolE[i].correct];
                    }
                }

                var rowTU = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('exam-tech-a')
                        .setLabel('A')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('exam-tech-b')
                        .setLabel('B')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('exam-tech-c')
                        .setLabel('C')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('exam-tech-d')
                        .setLabel('D')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                );
                var rowGU = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('exam-general-a')
                        .setLabel('A')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('exam-general-b')
                        .setLabel('B')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('exam-general-c')
                        .setLabel('C')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('exam-general-d')
                        .setLabel('D')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                );
                var rowEU = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('exam-extra-a')
                        .setLabel('A')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('exam-extra-b')
                        .setLabel('B')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('exam-extra-c')
                        .setLabel('C')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('exam-extra-d')
                        .setLabel('D')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                );

                for(var i = 0; i < rowTU.components.length; i++) {
                    if(rowTU.components[i].data.label.includes(answerCorrectT.toUpperCase())) {
                        rowTU.components[i].setStyle(ButtonStyle.Success);
                    }
                }
                for(var i = 0; i < rowGU.components.length; i++) {
                    if(rowGU.components[i].data.label.includes(answerCorrectG.toUpperCase())) {
                        rowGU.components[i].setStyle(ButtonStyle.Success);
                    }
                }
                for(var i = 0; i < rowEU.components.length; i++) {
                    if(rowEU.components[i].data.label.includes(answerCorrectE.toUpperCase())) {
                        rowEU.components[i].setStyle(ButtonStyle.Success);
                    }
                }

                oldT.edit({ components: [rowTU] });
                oldG.edit({ components: [rowGU] });
                oldE.edit({ components: [rowEU] });

                // For some reason, I can't do this.updateCorrect() here, but can do it in init()
                module.exports.updateCorrect();
            } catch(e) {
                console.log(e);
            }
            try {
                channel.send(`Questions for ${new Date().toLocaleDateString()}`);
                var idTech = '';
                var idGeneral = '';
                var idExtra = '';
                var randT = Math.floor(Math.random() * poolT.length);
                var randG = Math.floor(Math.random() * poolG.length);
                var randE = Math.floor(Math.random() * poolE.length);
            
                var embedT = new EmbedBuilder()
                    .setColor(0x500000)
                    .setTitle('Technician question')
                    .addFields(
                        { name: 'Question', value: `[${poolT[randT].id}] ${poolT[randT].question}` },
                        { name: 'Answers', value: `A. ${poolT[randT].answers[0]}\nB. ${poolT[randT].answers[1]}\nC. ${poolT[randT].answers[2]}\nD. ${poolT[randT].answers[3]}\n`}
                    )
                
                const rowT = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('exam-tech-a')
                            .setLabel('A')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('exam-tech-b')
                            .setLabel('B')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('exam-tech-c')
                            .setLabel('C')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('exam-tech-d')
                            .setLabel('D')
                            .setStyle(ButtonStyle.Primary),
                    );
                if(poolT[randT].question.toUpperCase().includes('FIGURE T-1')) {
                    const file = new AttachmentBuilder('./resources/exams/T-1.png');
                    embedT.setImage('attachment://T-1.png');
                    let sent = await channel.send({ embeds: [embedT], files: [file], components: [rowT] });
                    idTech = sent.id;
                } else if(poolT[randT].question.toUpperCase().includes('FIGURE T-2')) {
                    const file = new AttachmentBuilder('./resources/exams/T-2.png');
                    embedT.setImage('attachment://T-2.png');
                    let sent = await channel.send({ embeds: [embedT], files: [file], components: [rowT] });
                    idTech = sent.id;
                } else if(poolT[randT].question.toUpperCase().includes('FIGURE T-3')) {
                    const file = new AttachmentBuilder('./resources/exams/T-3.png');
                    embedT.setImage('attachment://T-3.png');
                    let sent = await channel.send({ embeds: [embedT], files: [file], components: [rowT] });
                    idTech = sent.id;
                } else {
                    let sent = await channel.send({ embeds: [embedT], components: [rowT] });
                    idTech = sent.id;
                }

                var embedG = new EmbedBuilder()
                    .setColor(0x500000)
                    .setTitle('General question')
                    .addFields(
                        { name: 'Question', value: `[${poolG[randG].id}] ${poolG[randG].question}` },
                        { name: 'Answers', value: `A. ${poolG[randG].answers[0]}\nB. ${poolG[randG].answers[1]}\nC. ${poolG[randG].answers[2]}\nD. ${poolG[randG].answers[3]}\n`}
                    )
            
                const rowG = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('exam-general-a')
                            .setLabel('A')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('exam-general-b')
                            .setLabel('B')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('exam-general-c')
                            .setLabel('C')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('exam-general-d')
                            .setLabel('D')
                            .setStyle(ButtonStyle.Primary),
                    );
                if(poolG[randG].question.toUpperCase().includes('FIGURE G7-1')) {
                    const file = new AttachmentBuilder('./resources/exams/G7-1.png');
                    embedG.setImage('attachment://G7-1.png');
                    let sent = await channel.send({ embeds: [embedG], files: [file], components: [rowG] });
                    idGeneral = sent.id;
                } else {
                    let sent = await channel.send({ embeds: [embedG], components: [rowG] });
                    idGeneral = sent.id;
                }

                var embedE = new EmbedBuilder()
                    .setColor(0x500000)
                    .setTitle('Extra question')
                    .addFields(
                        { name: 'Question', value: `[${poolE[randE].id}] ${poolE[randE].question}` },
                        { name: 'Answers', value: `A. ${poolE[randE].answers[0]}\nB. ${poolE[randE].answers[1]}\nC. ${poolE[randE].answers[2]}\nD. ${poolE[randE].answers[3]}\n`}
                    )
            
                const rowE = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('exam-extra-a')
                            .setLabel('A')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('exam-extra-b')
                            .setLabel('B')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('exam-extra-c')
                            .setLabel('C')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('exam-extra-d')
                            .setLabel('D')
                            .setStyle(ButtonStyle.Primary),
                    );
                if(poolE[randE].question.toUpperCase().includes('FIGURE E5-1')) {
                    const file = new AttachmentBuilder('./resources/exams/E5-1.png');
                    embedE.setImage('attachment://E5-1.png');
                    let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
                    idExtra = sent.id;
                } else if(poolE[randE].question.toUpperCase().includes('FIGURE E6-1')) {
                    const file = new AttachmentBuilder('./resources/exams/E6-1.png');
                    embedE.setImage('attachment://E6-1.png');
                    let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
                    idExtra = sent.id;
                } else if(poolE[randE].question.toUpperCase().includes('FIGURE E6-2')) {
                    const file = new AttachmentBuilder('./resources/exams/E6-2.png');
                    embedE.setImage('attachment://E6-2.png');
                    let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
                    idExtra = sent.id;
                } else if(poolE[randE].question.toUpperCase().includes('FIGURE E6-3')) {
                    const file = new AttachmentBuilder('./resources/exams/E6-3.png');
                    embedE.setImage('attachment://E6-3.png');
                    let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
                    idExtra = sent.id;
                } else if(poolE[randE].question.toUpperCase().includes('FIGURE E7-1')) {
                    const file = new AttachmentBuilder('./resources/exams/E7-1.png');
                    embedE.setImage('attachment://E7-1.png');
                    let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
                    idExtra = sent.id;
                } else if(poolE[randE].question.toUpperCase().includes('FIGURE E7-2')) {
                    const file = new AttachmentBuilder('./resources/exams/E7-2.png');
                    embedE.setImage('attachment://E7-2.png');
                    let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
                    idExtra = sent.id;
                } else if(poolE[randE].question.toUpperCase().includes('FIGURE E7-3')) {
                    const file = new AttachmentBuilder('./resources/exams/E7-3.png');
                    embedE.setImage('attachment://E7-3.png');
                    let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
                    idExtra = sent.id;
                } else if(poolE[randE].question.toUpperCase().includes('FIGURE E9-1')) {
                    const file = new AttachmentBuilder('./resources/exams/E9-1.png');
                    embedE.setImage('attachment://E9-1.png');
                    let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
                    idExtra = sent.id;
                } else if(poolE[randE].question.toUpperCase().includes('FIGURE E9-2')) {
                    const file = new AttachmentBuilder('./resources/exams/E9-2.png');
                    embedE.setImage('attachment://E9-2.png');
                    let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
                    idExtra = sent.id;
                } else if(poolE[randE].question.toUpperCase().includes('FIGURE E9-3')) {
                    const file = new AttachmentBuilder('./resources/exams/E9-3.png');
                    embedE.setImage('attachment://E9-3.png');
                    let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
                    idExtra = sent.id;
                } else {
                    let sent = await channel.send({ embeds: [embedE], components: [rowE] });
                    idExtra = sent.id;
                }
                
                const today = new Date().toISOString().slice(0, 10)
                questions.push({'date': today, 'idTech': idTech, 'idGeneral': idGeneral, 'idExtra': idExtra})
                fs.writeFile('./resources/exams/questions.json', JSON.stringify(questions, null, 2), function writeJSON(err) {
                    if (err) return console.log(err);
                    JSON.stringify(questions, null, 2);
                });
            } catch(e) {
                console.log(e);
            }
        });
        job.start();
    },
    answers: function(interaction) {
        // Load records and get today's date
        var poolT = JSON.parse(fs.readFileSync('./resources/exams/technician.json', 'utf8'));
        var poolG = JSON.parse(fs.readFileSync('./resources/exams/general.json', 'utf8'));
        var poolE = JSON.parse(fs.readFileSync('./resources/exams/extra.json', 'utf8'));
        var answers = JSON.parse(fs.readFileSync('./resources/exams/answers.json', 'utf8'));
        const today = new Date().toISOString().slice(0, 10)

        // Get button press information
        var user = interaction.user.id;
        var name = interaction.user.username ?? 'Unknown';
        var pool = interaction.customId.split('-')[1];
        var answer = interaction.customId.split('-')[2];

        var fields = interaction.message.embeds[0].fields;
        var question = '';
        for(var i = 0; i < fields.length; i++) {
            if(fields[i].name == 'Question') {
                question = fields[i].value.split(']')[0].split('[')[1];
            }
        }

        var answerChoices = ['a', 'b', 'c', 'd']
        var answerCorrect = '';
        if(question[0] == 'T') {
            for(var i = 0; i < poolT.length; i++) {
                if(poolT[i].id == question) {
                    answerCorrect = answerChoices[poolT[i].correct];
                }
            }
        } else if(question[0] == 'G') {
            for(var i = 0; i < poolG.length; i++) {
                if(poolG[i].id == question) {
                    answerCorrect = answerChoices[poolG[i].correct];
                }
            }
        } else if(question[0] == 'E') {
            for(var i = 0; i < poolE.length; i++) {
                if(poolE[i].id == question) {
                    answerCorrect = answerChoices[poolE[i].correct];
                }
            }
        } else {
            console.log('Unknown question');
        }

        // Find user if they have answered in the past
        var index = -1;
        for(var i = 0; i < answers.length; i++) {
            if(answers[i].id == user) {
                index = i;
                break;
            }
        }

        if(index != -1) {
            // If they have answered in the past, update username if it was unknown
            if(answers[i].nickname == 'Unknown' && name != 'Unknown') {
                answers[i].nickname = name;
            }

            // Find answer for today if it exists and modify, otherwise add new answer record
            var answerList = answers[i].answers;
            var prevAnswered = false;
            for(var i = 0; i < answerList.length; i++) {
                if(answerList[i].date === today && answerList[i].pool == pool && answerList[i].question == question) {
                    if(answerList[i].answer != answer) {
                        answerList[i].answer = answer;
                    }
                    prevAnswered = true;
                }
            }
            if(!prevAnswered) {
                answerList.push({'date': today, 'pool': pool, 'question': question, 'answerCorrect': answerCorrect, 'answer': answer})
            }
        } else {
            answers.push({'id': user, 'nickname': name, 'correct': 0, 'answered': 0, 'answers': [{'date': today, 'pool': pool, 'question': question, 'answerCorrect': answerCorrect, 'answer': answer}]})
        }

        fs.writeFile('./resources/exams/answers.json', JSON.stringify(answers, null, 2), function writeJSON(err) {
            if (err) return console.log(err);
            JSON.stringify(answers, null, 2);
        });
        interaction.reply({ content: 'Answer Recorded', ephemeral: true })
    },
    updateCorrect: async function() {
        var answers = JSON.parse(fs.readFileSync('./resources/exams/answers.json', 'utf8'));
        for(var i = 0; i < answers.length; i++) {
            var correct = 0;
            for(var j = 0; j < answers[i].answers.length; j++) {
                if(answers[i].answers[j].answer == answers[i].answers[j].answerCorrect) {
                    correct++;
                }
            }
            answers[i].answered = answers[i].answers.length;
            answers[i].correct = correct;
        }
        fs.writeFile('./resources/exams/answers.json', JSON.stringify(answers, null, 2), function writeJSON(err) {
            if (err) return console.log(err);
            JSON.stringify(answers, null, 2);
        });
    }
   };
