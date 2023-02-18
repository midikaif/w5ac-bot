const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('lookup')
        .setDescription('Looks up a callsign on hamdb.')
        .addStringOption(option => option.setName('call')
            .setDescription('The callsign to return')
            .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const get = await fetch(`http://api.hamdb.org/v1/${interaction.options.getString('call')}/json/W5AC`).then((res) => res.json());

        if (get.hamdb.callsign.call === "NOT_FOUND") {
            await interaction.editReply({content: `Call sign ${interaction.options.getString('call')} not found in HamDB!`});
            return;
        }
        // Handle the name correctly
        let ham_name = get.hamdb.callsign.name;
        let given_name = get.hamdb.callsign.fname;
        let middle_init = get.hamdb.callsign.mi;

        if (middle_init !== '')
            ham_name = given_name + " " + middle_init + ". " + ham_name;
        else if (given_name !== '')
            ham_name = given_name + " " + ham_name;

        // Different class types
        let license_class;
        switch (get.hamdb.callsign.class) {
            case "E":
                license_class = "Amateur Extra";
                break;
            case "G":
                license_class = "General";
                break;
            case "T":
                license_class = "Technician";
                break;
            case "":
                license_class = "Club";
                break;
            default:
                license_class = "Other";
                break;
        }

        // Status
        let ham_status;
        switch (get.hamdb.callsign.status) {
            case "A":
                ham_status = "Active";
                break;
            default:
                ham_status = "Inactive";
                break;
        }

        const embed = new EmbedBuilder()
            .setColor(0x3C0000)
            .setTitle(`Record for ${get.hamdb.callsign.call}`)
            .setDescription(`[See ${get.hamdb.callsign.call} on QRZ](https://www.qrz.com/db/?callsign=${get.hamdb.callsign.call})`)
            .setAuthor({ name: "HamDB Database"})
            .setURL(`http://hamdb.org/${get.hamdb.callsign.call}`)
            .addFields(
                { name: 'Name: ', value: ham_name },
                { name: 'Class: ', value: license_class, inline: true },
                { name: 'Status: ', value: ham_status, inline: true },
                { name: 'Grid: ', value: get.hamdb.callsign.grid, inline: true },
            )
            .setTimestamp()
        await interaction.editReply({ embeds: [embed] });
    },
};