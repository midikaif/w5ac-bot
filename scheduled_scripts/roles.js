const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, AttachmentBuilder, EmbedBuilder, RoleSelectMenuBuilder } = require('discord.js');
const util = require('node:util');

module.exports = {
    configFile: null,
    client: null,
    init: function(client, config) {
        this.client = client;
        this.configFile = config;
        // this.roleMessage();
    },
    roleMessage: async function() {
        let channel = this.client.channels.cache.find(ch => ch.name === this.configFile.role_chan);
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('role-class-tech')
                    .setLabel('Technician')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('role-class-general')
                    .setLabel('General')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('role-class-extra')
                    .setLabel('Extra')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('role-extra-net')
                    .setLabel('Net Controller')
                    .setStyle(ButtonStyle.Primary),
            );

		const embed = new EmbedBuilder()
			.setColor(0x500000)
			.setTitle('Roles')
			.setDescription('Click the roles that corespond to your license class and optional channels');

		await channel.send({embeds: [embed], components: [row] });
    },
    update: async function(interaction) {
        await interaction.deferReply({ephemeral: true});
        switch(interaction.customId) {
            case 'role-class-tech':
                if (interaction.member.roles.cache.has(interaction.guild.roles.cache.find(role => role.name === "Technician").id)) {
                    try {
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Technician"));
                        await interaction.followUp({ content: 'Successfully removed role!', ephemeral: true });
                    } catch (e) {
                        break;
                    }
                } else {
                    try {
                        interaction.member.roles.add(interaction.guild.roles.cache.find(role => role.name === "Technician"));
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "General"));
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Extra"));
                        await interaction.followUp({ content: 'Successfully added role!', ephemeral: true });
                    } catch (e) {
                        break;
                    }
                }
                break;
            case 'role-class-general':
                if (interaction.member.roles.cache.has(interaction.guild.roles.cache.find(role => role.name === "General").id)) {
                    try {
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "General"));
                        await interaction.followUp({ content: 'Successfully removed role!', ephemeral: true });
                    } catch (e) {
                        break;
                    }
                } else {
                    try {
                        interaction.member.roles.add(interaction.guild.roles.cache.find(role => role.name === "General"));
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Technician"));
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Extra"));
                        await interaction.followUp({ content: 'Successfully added role!', ephemeral: true });
                    } catch (e) {
                        break;
                    }
                }
                break;
            case 'role-class-extra':
                if (interaction.member.roles.cache.has(interaction.guild.roles.cache.find(role => role.name === "Extra").id)) {
                    try {
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Extra"));
                        await interaction.followUp({ content: 'Successfully removed role!', ephemeral: true });
                    } catch (e) {
                        break;
                    }
                } else {
                    try {
                        interaction.member.roles.add(interaction.guild.roles.cache.find(role => role.name === "Extra"));
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Technician"));
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "General"));
                        await interaction.followUp({ content: 'Successfully added role!', ephemeral: true });
                    } catch (e) {
                        break;
                    }
                }
                break;
            case 'role-extra-net':
                if (interaction.member.roles.cache.has(interaction.guild.roles.cache.find(role => role.name === "Net Controller").id)) {
                    interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Net Controller"));
                    await interaction.followUp({ content: 'Successfully removed role!', ephemeral: true });
                } else {
                    interaction.member.roles.add(interaction.guild.roles.cache.find(role => role.name === "Net Controller"));
                    await interaction.followUp({ content: 'Successfully added role!', ephemeral: true });
                }
                break;
            default:
                await interaction.followUp({ content: 'Can\'t find role', ephemeral: true});
        }
    }
   };
