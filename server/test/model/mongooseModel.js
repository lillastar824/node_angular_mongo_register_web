const { chai, app, should } = require('../lib/main');

const assert = require('chai').assert;
// var expect = require('chai').expect;
// var mongoose = require('mongoose');
var brands = require('../../models/brands.model');

// before(function (done) {
//     mongoose.connect(process.env.MONGODB_URL)
//     const db = mongoose.connection;
//     db.on('error', console.error.bind(console, 'connection error'));
//     db.once('open', function() {
//       //console.log('We are connected to test database!');
//       done();
//     });
//   });

describe ('Brand Model',function() {
    it('Save should brand name',function(done){
        let b = new  brands ({name:'TATA11'});
        b.save(err=>{
            if(!err){
                assert(!b.isNew);
                done(); 
            }
        }
        );
    });

    it('Save should not save duplicate brand name',function(done){
        let c = new  brands ({name:'TATA11'});
        c.save(err=>{
            assert(err.code === 11000)
            done();
        });
    });
});

// after(function(done){
//         mongoose.connection.db.dropDatabase(function(){
//           mongoose.connection.close(done);
//         });
// });
