import express from 'express';
import loadSetlists from "./src/load_setlists";

const app = express();


app.use(express.json());

app.get('/', (req, res) => {
    loadSetlists("6faa7ca7-0d99-4a5e-bfa6-1fd5037520c6");
    return res.status(200).send("Ok");
});

app.listen(3001);
console.log('app running on port.', 3001);
