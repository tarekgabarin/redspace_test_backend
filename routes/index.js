var express = require('express');
var router = express.Router();
var axios = require('axios');

router.get('/:id', function(req, res, next) {

  var url = `https://swapi.co/api/people/${req.params.id}`;

  return axios.get(url).then(person => {

    person = person.data;
    urlData = {};

    axios.get(person.homeworld).then(homeworld => {

      homeworld = homeworld.data
      
      urlData['homeworld'] = {
        name: homeworld.name,
        terrain: homeworld.terrain,
        population: homeworld.population
      };

      let formatData = (type, data) => {

        if (type === 'films'){
          return {
            title: data.title,
            director: data.director,
            producers: data.producers,
            release_date: data.release_date
          }
        } else if (type === 'species'){
          return {
            name: data.name,
            classification: data.classification,
            average_lifespan: data.average_lifespan,
            language: data.language
          }
        }

      }

      let getUrlsForNestedData = (arr ,type) => {

        let promises = [];
  
        arr.forEach((url) => {
          promises.push(axios.get(url))
        });

        return axios.all(promises).then((results) => {
  
          let resultsArr = [];
  
          for (let i = 0; i < results.length; i++) {

            let entry = formatData(type, results[i].data)
            resultsArr.push(entry)
          }
  
          urlData[type] = resultsArr;
  
        });
      }


      Promise.all([getUrlsForNestedData(person.films, 'films'), getUrlsForNestedData(person.species, 'species')]).then(() => {

          let returnData = {
            name: person.name,
            height: person.height,
            mass: person.mass,
            hair_color: person.hair_color,
            skin_color: person.skin_color,
            gender: person.gender,
            ...urlData,
          }

          res.json(returnData);

      });
    });

  }).catch(err => {
    if(err){
      throw err;
    }
  })

});

module.exports = router;
