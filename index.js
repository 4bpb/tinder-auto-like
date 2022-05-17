const fetch = require('node-fetch');
require('dotenv').config()

let set = new Set()

function main(){
    fetch('https://api.gotinder.com/v3/auth/login', {
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

        
        recommendations(auth_token)
    })
}

function recommendations(auth_token){
    fetch('https://api.gotinder.com/v2/recs/core?locale=en', {
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
                console.log('HARD RATE_LIMIT')
                process.exit()
            }
        } catch (error) {
            
        }

        let results = json.data.results

        results.forEach(element => {
            let id = element.user._id
            let bio = element.user.bio
            let gender = element.user.gender
            let birthday = element.user.birth_date

            let s_number = element.s_number
            let content_hash = element.content_hash



            fetch('https://api.gotinder.com/like/'+id, {
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
                    'content_hash': content_hash
                })
            })
            .then(res => res.json())
            .then(json => {
                if(json.status == 200){
                    console.log('Liked '+ id + 'Is Repeat? '  + set.has(id))
                    set.add(id)
                }
            })
            .catch(err => {
                console.log('Possible Error in Response... Is Repeat? ' + set.has(id))
                set.add(id)
            })

            
            if(results[results.length - 1].user._id == id){
                main()
                
            }
        });
    });
}

main()