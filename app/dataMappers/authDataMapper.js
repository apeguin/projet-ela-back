const client = require('./client');

module.exports = {
    findUserByEmail: async function (email) {
        const result = await client.query('SELECT * FROM "user" WHERE email = $1', [email]);
        return result.rows[0];
    },
    findUserByAlias: async function (alias) {
        const result = await client.query('SELECT * FROM "user" WHERE alias = $1', [alias]);
        return result.rows[0];
    }
}