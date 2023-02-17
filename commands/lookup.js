const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('lookup')
        .setDescription('Looks up a callsign.')
        .addStringOption(option => option.setName('call')
            .setDescription('The callsign to return')
            .setRequired(true)),
    async execute(interaction) {
        const get = await fetch(`http://api.hamdb.org/v1/${interaction.options.getString('call')}/json/W5AC`).then((res) => res.json());
        await interaction.reply({ content: JSON.stringify(get)});
    },
};