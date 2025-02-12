export default (req, res) => {
	res.status(404).send(`That page (${req.url}) was not found.`);
};