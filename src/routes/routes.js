
import express from 'express';

import * as db from '../db/queries.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Poke Shop API' });
});

router.get('/bowls', (req, res) => {
    db.getAllBowls().then(bowls => {
        res.json(bowls);
    });
});

router.get('/bowls/protein/:protein', (req, res) => {
    db.getBowlsByProtein(req.params.protein).then(bowls => {
        res.json(bowls);
    });
});

router.get('/bowls/size/:size', (req, res) => {
    db.getBowlsBySize(req.params.size).then(bowls => {
        res.json(bowls);
    });
});

router.get('/bowls/id/:id', (req, res) => {
    db.getBowlById(req.params.id).then(bowl => {
        res.json(bowl);
    });
});


router.post('/bowls/add', (req, res) => {
    db.insertBowl(req.body).then(bowl => {
        res.json(bowl);
    });
});

router.delete('/bowls/delete/:id', (req, res) => {
    db.deleteBowl(req.params.id).then(bowl => {
        res.json(bowl);
    });
});

router.put('/bowls/update/:id', (req, res) => {
    db.updateBowlQuantity(req.params.id, req.body).then(bowl => {
        res.json(bowl);
    });
});

router.put('/bowls/update/size/:size', (req, res) => {
    db.updateAllBowlsOfSize(req.params.size, req.body).then(bowl => {
        res.json(bowl);
    });
});





export default router;
