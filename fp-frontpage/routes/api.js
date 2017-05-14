/**
 * Created by snooze on 13/05/17.
 */

var express = require('express');
var router = express.Router();

var Fingerprint = require('../schemas/fingerprint');
var Dummy = require('../schemas/dummy');

var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client( {
    host: 'localhost:9200',
    // For debugging purposes
    // log: 'trace'
});
var index = 'fp_data';
var index_dummy = 'fp_dummy';

function setup(){
    client.indices.create({
        index: index
    }, function(err, resp, status){
        if (err){
            client.indices.exists({index: index}, function(err, resp, status){
                if (!err && resp) {
                    console.log('[debug] Index already exists');
                } else {
                    throw new Error('Cannot create index')
                }
                })
        } else {
            console.log('[debug] Index created')
        }
    })
}

function setup_dummy(){
    client.indices.create({
        index: index_dummy
    }, function(err, resp, status){
        if (err){
            client.indices.exists({index: index_dummy}, function(err, resp, status){
                if (!err && resp) {
                    console.log('[debug] Dummy Index already exists');
                } else {
                    throw new Error('Cannot create index')
                }
            })
        } else {
            console.log('[debug] Index created')
        }
    })
}

setup();
setup_dummy();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('I don\'t think that you understands how this works');
});

router.post('/push', function (req, res, next) {
    var fingerprint = new Fingerprint(req.body.fingerprint);
    console.log('-- Pushing data:');
    console.log(req.body.fingerprint);

    if (!Object.keys(fingerprint.toObject()).length){
        // Empty
        return res.json({status: 'invalid format'})
    } else {
        client.index({
            index: index,
            type: index,
            body: fingerprint.toObject()
        }, function(err, resp, status){
            if (err) return next(err);
            return res.json({status: 'object inserted', data: fingerprint, resp: resp})
        });
    }
});

router.post('/push-dummy', function (req, res, next) {
    var dummy = new Dummy(req.body);

    if (!Object.keys(data.toObject()).length){
        // Empty
        return res.json({status: 'invalid format'})
    } else {
        client.index({
            index: 'fp-dummy',
            type: 'fp-dummy',
            body: dummy.toObject()
        }, function(err, resp, status){
            if (err) return next(err);
            return res.json({status: 'object inserted', data: dummy, resp: resp})
        });
    }
});

router.get('/info', function(req,res,next){
    client.cluster.health({},function(err,resp,status) {
        res.json({info: resp})
    });
});

module.exports = router;