## CONFIGURATIONS

All configurations are saved in the [config.js](/config.json) file.  

NOTE: In this document all `config.<obj>` variables refer to the data in the *config.json* file. 

### Server Configs

#### PORT
| Variable | Description |
| ----     | ----        |
`process.env.PORT` |(Can be described in shell env, or in Heroku type platforms)
`config.PORT` |(Falls back to config file if above not found)

#### Mailer
We use Sendgrid to send mails, and you need a Sendgrid API to make it work. 

| Variable | Description |
| ----     | ----        |
`process.env.SENDGRID_API_KEY` | (Tries to get from shell env first) 
`config.SENDGRID_API_KEY` | (Falls back to config file) 


#### Images
We need to process all the speaker images and there are certain configs used - 

| Variable | Description |
| ----     | ----        |
`config.speaker_images.MAX_WIDTH` |(Max needed height of speaker image)
`config.speaker_images.MAX_HEIGHT` |(Max needed width of speaker image)
`config.speaker_images.TRACK_HEIGHT_REM` |(Speaker image height, in CSS rem units, for tracks page)
`config.speaker_images.TRACK_WIDTH_REM` |(Speaker image width, in CSS rem units, for tracks page)

#### Audio 
Some sessions can have a recorded audio attached to them. The parameters for that are 

| Variable | Description |
| ----     | ----        |
`config.audio_files.MAX_SIZE_MB` | Max size of the audio (limited by Github file size)