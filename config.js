var config = {};

config.eklase = {};

config.eklase.login_url = process.env.EKLASE_LOGIN_URL || 'https://my.e-klase.lv';
config.eklase.user_name = process.env.EKLASE_USER || '-'; // Eklases username.
config.eklase.password =  process.env.EKLASE_PASSWORD || '-'; // Eklases parole.

module.exports = config;
