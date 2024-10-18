import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'chat_history.sqlite'
});

const Conversation = sequelize.define('Conversation', {
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

export { sequelize, Conversation };