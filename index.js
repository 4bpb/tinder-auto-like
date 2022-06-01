const fetch = require('node-fetch');
require('dotenv').config()
const randomLocation = require('random-location')
let log = require('./logger.js')
let set = new Set()





fetch(process.env.WEBHOOK,{
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        username: 'Tinder Bot',
        avatar_url : 'https://tinder.com/favicon-32x32.png',
        content : "Tinder Bot Started",

    })
})
.then(res => res.text())
.then(body => {
    console.log(body)
}) 


function main(){
    fetch('https://api.gotinder.com/v3/auth/login', {
        timeout: 10000,
        method: 'POST',
        headers: {
            'Host': 'api.gotinder.com',
            'User-Agent': 'Tinder/13.7.0 (iPhone; iOS 15.4.1; Scale/3.00)',
            'persistent-device-id': process.env.DEVICEID,
            'locale': 'en',
            'Accept-Language': 'en-US,en;q=0.9',
            'Content-Type': 'application/x-google-protobuf',
            'Accept': '*/*'
        },
        body: process.env.LOGINPROTOBUF
    })
    .then(res => res.text())
    .then(body => {
        let split_one = body.split('$')
        let split_two = split_one[1].split('"')

        let auth_token = split_two[0]
        travel_to_local_locations(auth_token)
        //get_popular_locations(auth_token)
        //recommendations(auth_token)
    }) 
}

function recommendations(auth_token){
    fetch('https://api.gotinder.com/v2/recs/core?locale=en', {
        timeout: 10000,
        headers: {
            'Host': 'api.gotinder.com',
            'User-Agent': 'Tinder/13.7.0 (iPhone; iOS 15.4.1; Scale/3.00)',
            'support-short-video': '1',
            'connection-type': 'wifi',
            'X-Auth-Token': auth_token,
            'connection-speed': '0.0',
            'platform': 'ios',
            'Accept-Language': 'en-US,en;q=0.9',
            'tinder-version': '13.7.0',
            'Accept': '*/*'
        }
    })
    .then(res => res.json())
    .then(json => {
        
        
        try {
            if(json.error.message == 'RATE_LIMITED'){
                log('HARD RATE_LIMIT, Trying Explore Catalogs...','err')
                explore_recommendations_catalogs(auth_token)

            }
        } catch (error) {
            try {
                let results = json.data.results

                results.forEach(element => {
                    let id = element.user._id
                    let bio = element.user.bio
                    let gender = element.user.gender
                    let birthday = element.user.birth_date
        
                    let s_number = element.s_number
                    let content_hash = element.content_hash
        
        
        
                    fetch('https://api.gotinder.com/like/'+id, {
                        timeout: 10000,
                        method: 'POST',
                        headers: {
                            'Host': 'api.gotinder.com',
                            'x-supported-image-formats': 'webp, jpeg',
                            'Accept': '*/*',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'platform': 'ios',
                            'User-Agent': 'Tinder/13.7.0 (iPhone; iOS 15.4.1; Scale/3.00)',
                            'X-Auth-Token': auth_token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            's_number': s_number,
                            'is_boosting': '1',
                            'content_hash': content_hash
                        })
                    })
                    .then(res => res.json())
                    .then(json => {
                        if(json.status == 200){
                            log('Liked '+ id + 'Is Repeat? '  + set.has(id),'ok')
                            set.add(id)
                        }
                    })
                    .catch(err => {
                        log('Possible Error in Response... Is Repeat? ' + set.has(id),'err')
                        retry_like(id,auth_token)
                    })
        
                    
                    if(results[results.length - 1].user._id == id){
                        main()
                        
                    }
                });
            } catch (error) {
                log('likley you are out of local people, trying to random popular location','init')
                //get_popular_locations(auth_token)
                travel_to_local_locations(auth_token)
            }
        }


    });
}


function explore_recommendations_catalogs(auth_token){
    fetch('https://api.gotinder.com/v2/explore?locale=en', {
        timeout: 10000,
        headers: {
            'Host': 'api.gotinder.com',
            'x-supported-image-formats': 'webp,jpeg',
            'accept-language': 'en,en-US',
            'x-auth-token': auth_token,
            'platform': 'web',
            'sec-gpc': '1',
            'origin': 'https://tinder.com',
            'sec-fetch-site': 'cross-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://tinder.com/'
        }
    })
    .then(res => res.json())
    .then(json => {
        let explore_catalogs = json.data.next_catalog_ids
        
        explore_catalogs.forEach(element => {
            like_from_rec_cata(element,auth_token)
        });
    })
    .catch(err => {
        //console.log('Possible Error in Response...')

    })
}


function like_from_rec_cata(cata_id,auth_token){
    fetch('https://api.gotinder.com/v2/explore/recs?locale=en&catalog_id='+cata_id, {
        timeout: 10000,
        headers: {
            'Host': 'api.gotinder.com',
            'x-supported-image-formats': 'webp,jpeg',
            'support-short-video': '1',
            'accept-language': 'en,en-US',
            'x-auth-token': auth_token,
            'sec-gpc': '1',
            'origin': 'https://tinder.com',
            'sec-fetch-site': 'cross-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://tinder.com/'
        }
    })
    .then(res => res.json())
    .then(json => {
        let results = json.data.results

        results.forEach(element => {
            let id = element.user._id
            let bio = element.user.bio
            let gender = element.user.gender
            let birthday = element.user.birth_date

            let s_number = element.s_number
            let content_hash = element.content_hash



            fetch('https://api.gotinder.com/like/'+id, {
                timeout: 10000,
                method: 'POST',
                headers: {
                    'Host': 'api.gotinder.com',
                    'x-supported-image-formats': 'webp, jpeg',
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'platform': 'ios',
                    'User-Agent': 'Tinder/13.7.0 (iPhone; iOS 15.4.1; Scale/3.00)',
                    'X-Auth-Token': auth_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    's_number': s_number,
                    'is_boosting': '1',
                    'content_hash': content_hash
                })
            })
            .then(res => res.json())
            .then(json => {
                if(json.status == 200){
                    log('Liked '+ id + ' Catalog ID ' + cata_id + ' Is Repeat? '  + set.has(id),'ok')
                    set.add(id)
                }
            })
            .catch(err => {
                log('Possible Error in Response...' + '  Catalog ID ' + cata_id + ' Is Repeat? ' + set.has(id),'err')
                if(set.has(id) == false){
                    retry_like(id,auth_token,s_number,content_hash)
                }
            })

            if(results[results.length - 1].user._id == id && set.has(id) == true){
                travel_to_local_locations(auth_token)
            }
            else {
                explore_recommendations_catalogs(auth_token)
            }
        });
        
    })
    .catch(err => {
        //console.log('Possible Error in Response...')

    })

}


function retry_like(user_id,auth_token,s_number,content_hash){
    fetch('https://api.gotinder.com/like/'+user_id, {
        method: 'POST',
        timeout: 10000,
        headers: {
            'Host': 'api.gotinder.com',
            'x-supported-image-formats': 'webp, jpeg',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'platform': 'ios',
            'User-Agent': 'Tinder/13.7.0 (iPhone; iOS 15.4.1; Scale/3.00)',
            'X-Auth-Token': auth_token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            's_number': s_number,
            'is_boosting': '1',
            'content_hash': content_hash
        })
    })
    .then(res => res.json())
    .then(json => {
        if(json.status == 200){
            log('Retry on User '+ id + ' Worked','ok')
            set.add(id)
        }
    })
    .catch(err => {
        //console.log('Possible Error on Retry')
        if(set.has(user_id) == false){
            //retry_like(user_id,auth_token,s_number,content_hash)
        }
        
    })
}

function travel_to_local_locations(auth_token){
    const P = {
        latitude: process.env.LAT,
        longitude: process.env.LON
      }
       
      const R = process.env.DISTANCE // meters
       
      let randomPoint = randomLocation.randomCirclePoint(P, R)

      fetch('https://api.gotinder.com/passport/user/travel', {
            method: 'POST',
            headers: {
                'Host': 'api.gotinder.com',
                'x-supported-image-formats': 'webp, jpeg',
                'Accept': '*/*',
                'Accept-Language': 'en-US;q=1',
                'platform': 'ios',
                'Content-Type': 'application/json',
                'User-Agent': 'Tinder/13.8.0 (iPhone; iOS 15.4.1; Scale/3.00)',
                'X-Auth-Token': auth_token
            },
            body: JSON.stringify({
                'lat': randomPoint.latitude,
                'lon': randomPoint.longitude
            })
        })
        .then(res => res.json())
        .then(json => {
            log('Location Localized, Restarting','res')
            recommendations(auth_token)
        })
}


function get_popular_locations(auth_token){
    fetch('https://api.gotinder.com/location/popular?locale=en', {
        headers: {
            'Host': 'api.gotinder.com',
            'x-supported-image-formats': 'webp, jpeg',
            'Accept': '*/*',
            'app-version': '4696',
            'tinder-version': '13.8.0',
            'Accept-Language': 'en-US,en;q=0.9',
            'platform': 'ios',
            'User-Agent': 'Tinder/13.8.0 (iPhone; iOS 15.4.1; Scale/3.00)',
            'X-Auth-Token': auth_token
        }
    })
    .then(res => res.json())
    .then(json => {
        let locations = json.results

        let ran_local = locations[Math.floor(Math.random() * (locations.length))]

        let lat = ran_local.lat
        let lon = ran_local.lon

        fetch('https://api.gotinder.com/passport/user/travel', {
            method: 'POST',
            headers: {
                'Host': 'api.gotinder.com',
                'x-supported-image-formats': 'webp, jpeg',
                'Accept': '*/*',
                'Accept-Language': 'en-US;q=1',
                'platform': 'ios',
                'Content-Type': 'application/json',
                'User-Agent': 'Tinder/13.8.0 (iPhone; iOS 15.4.1; Scale/3.00)',
                'X-Auth-Token': auth_token
            },
            body: JSON.stringify({
                'lat': lat,
                'lon': lon
            })
        })
        .then(res => res.json())
        .then(json => {
            log('Location Randomized, Restarting','res')
            recommendations(auth_token)
        })
    })
}
//get_local_locations()
main()