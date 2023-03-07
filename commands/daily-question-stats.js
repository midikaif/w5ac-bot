const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const fs = require('node:fs');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily-question-stats')
        .setDescription('Gets player statistics for daily license question')
        .addUserOption(option => option.setName('user')
            .setDescription('The user to find stats for')),
    async execute(interaction) {
        await interaction.deferReply();
        var answers = JSON.parse(fs.readFileSync('./resources/exams/answers.json', 'utf8'));
        var userId = interaction.options?.getUser('user')?.id ?? interaction.user.id;

        var playerIndex = -1;
        for(var i = 0; i < answers.length; i++) {
            if(answers[i].id === String(userId)) {
                playerIndex = i;
                break;
            }
        }
        if(playerIndex === -1) {
            await interaction.followUp('User not found in answers.');
            console.log('Couldn\'t find user');
            return;
        } else {
            try {
                var playerAnswers = answers[playerIndex].answers;
                var answeredTech = 0;
                var answeredGeneral = 0;
                var answeredExtra = 0;
                var correctTech = 0;
                var correctGeneral = 0;
                var correctExtra = 0;
                for(var i = 0; i < playerAnswers.length; i++) {
                    switch(playerAnswers[i].pool) {
                        case 'tech':
                            if(playerAnswers[i].answer === playerAnswers[i].answerCorrect) {
                                correctTech++;
                            }
                            answeredTech++;
                            break;
                        case 'general':
                            if(playerAnswers[i].answer === playerAnswers[i].answerCorrect) {
                                correctGeneral++;
                            }
                            answeredGeneral++;
                            break;
                        case 'extra':
                            if(playerAnswers[i].answer === playerAnswers[i].answerCorrect) {
                                correctExtra++;
                            }
                            answeredExtra++;
                            break;
                        default:
                            console.log(playerAnswers[i].pool)
                            break;
                    }
                }
                const embed = new EmbedBuilder()
                    .setColor(0x500000)
                    .setTitle(`Statistics for ${interaction.guild.members.cache.find(member => member.id === userId).displayName}`)
                    .setDescription(`Total: ${correctTech + correctGeneral + correctExtra}/${answeredTech + answeredGeneral + answeredExtra}\t${Math.round(((correctTech + correctGeneral + correctExtra)/(answeredTech + answeredGeneral + answeredExtra))*10000)/100}%`)
                    .addFields(
                        { name: 'Technician: ', value: `${correctTech}/${answeredTech}\t${Math.round((correctTech/answeredTech)*10000)/100}%` },
                        { name: 'General: ', value: `${correctGeneral}/${answeredGeneral}\t${Math.round((correctGeneral/answeredGeneral)*10000)/100}%` },
                        { name: 'Extra: ', value: `${correctExtra}/${answeredExtra}\t${Math.round((correctExtra/answeredExtra)*10000)/100}%` },
                    )
                    .setTimestamp()
                await interaction.followUp({ embeds: [embed] });
            } catch(e) {
                console.log(e);
            }
        }
    },
};