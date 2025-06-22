// This part creates a Discord slash command that

const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
        dataL new SlashCommandBuilder()
                .setName("create-a-run")
                