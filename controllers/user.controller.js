const home = (req, res) => {
    res.send('Hello from Controller');
}

const register = (req, res) => {
    res.send('Register Controller');
}

module.exports = { home, register };