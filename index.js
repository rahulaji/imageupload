const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const app = express();

app.use(express.static('public'))

const BUCKETNAME="uploadimagecode"

AWS.config.update({
    accessKeyId: "AKIA6ODU3IK6IFIIZI7S",
    secretAccessKey: "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",
    region: "eu-north-1"
})
// Define multer storage with file filter for images
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});


//Serves the index.html file.
app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/index.html')
})

// Lists all files in the S3 bucket. It retrieves file metadata from S3 and constructs URLs for each file
app.get('/files',(req,res)=>{
    const s3 = new AWS.S3();

    const listParams ={
        Bucket: BUCKETNAME
    }
    s3.listObjectsV2(listParams,(err,data)=>{
        if(err){
            console.log("error fetching files",err)
            return res.status(500).send("Internal Server Error")
        }
        const files = data.Contents.map((file)=>({
            name:file.Key,
            url:`https://${BUCKETNAME}.s3.amazonaws.com/${file.Key}`
        }))
        res.json(files)
    })
})

//Handles file uploads. It expects files to be uploaded with the key 'files'. It uploads each file to the S3 bucket using multer's memory storage and AWS SDK's s3.upload method
app.post('/upload',upload.array('files'),(req,res)=>{
    if(!req.files || req.files.length === 0){
        return res.status(400).send('No files were uploaded.')
    }
    const s3= new AWS.S3();
    const uploadPromises=req.files.map((file)=>{
        const uploadParams={
            Bucket: BUCKETNAME,
            Key: file.originalname,
            Body: file.buffer
        }
        return s3.upload(uploadParams).promise();
    })
    Promise.all(uploadPromises)
    .then((data)=>{
        data.forEach((uploadResult) => {
            console.log("file Uploaded successfully")
            res.redirect('/')
        });
    })
})

// Deletes a file from the S3 bucket. It takes the filename as a parameter and uses the AWS SDK's s3.deleteObject method to delete the file.
app.delete('/files/:name', (req, res) => {
    const s3 = new AWS.S3();
    const deleteParams = {
        Bucket: BUCKETNAME,
        Key: req.params.name
    }
    s3.deleteObject(deleteParams, (err, data) => {
        if (err) {
            console.error("Error deleting file: " + err.message);
            return res.status(500).send("Internal Server Error")
        }
        res.send("File deleted successfully")
        //res.redirect('/')
    })
})

// Downloads a file from the S3 bucket. It takes the filename as a parameter, retrieves the file from S3 using the AWS SDK's s3.getObject method, and sends the file data as the response.
app.get('/files/:name/download', (req, res) => {
    const s3 = new AWS.S3();
    const downloadParams = {
        Bucket: BUCKETNAME,
        Key: req.params.name
    }
    s3.getObject(downloadParams, (err, data) => {
        if (err) {
            console.error("Error downloading file: " + err);
            return res.status(500).send("Internal Server Error")
        }
        res.attachment(req.params.name);
        res.send(data.Body)
    })
})

app.listen(5000,()=>{
        console.log('Server running on port 5000');
})
