const { REST, Routes } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

const fs = require('fs');
//const col = require("colors");

let configFile = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
];

const rest = new REST({ version: '10' }).setToken(configFile.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(configFile.CLIENT), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }
});

client.on('messageDelete', async message => {
    console.log("del");
    try {
        if (message.author.bot) return;
        if (message.content === '') return;
        let channel = client.channels.cache.find(ch => ch.name === configFile.LOG_CHAN);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle(':wastebasket: Message Delete in #' + message.channel.name)
            .setAuthor({ name: message.author.username})
            .setDescription('Deleted on ' + new Date().toString())
            .addFields({name: 'Message content', value: "```" + message.content + "```"});
        channel.send({ embeds: [embed] });
    } catch (e) {
        console.error(e);
    }
});

client.login(configFile.TOKEN).catch(function() {
    console.error('Login failed. The token that you put in is most likely invalid.');
    process.exit(1);
});