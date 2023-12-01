const express = require('express');
const myApp = express();
const mongoose = require('mongoose')
const myProduct = require("./models/MyProducts");
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')
const upload = multer({ dest: 'uploads/' })
const path = require('path')
// middleware
myApp.use(express.json());
myApp.use(cors());
myApp.use(express.static(path.join(__dirname, "uploads")));


//image upload 
myApp.post("/uploading", upload.single('image'), (req, res) => {
    console.log(req.body);
    console.log(req.file);

    try {
        const extension = req.file.mimetype.split("/")[1];
        if (extension == "png" || extension == "jpg" || extension == "jpeg") {
            const fileNmae = req.file.filename + "." + extension;
            console.log(fileNmae);

            fs.rename(req.file.path, `uploads/${fileNmae}`, () => {
                console.log("\nFile Renamed!\n");
            });
            return res.json({
                message: "uploaded"
            })
        } else {
            fs.unlink(req.file.path, () => console.log("file deleted"))
            return res.json({
                message: "only images are accepted"
            })
        }

    } catch (error) {

    }
})







// get all product


myApp.get('/myProducts', async (req, res) => {
    try {
        const myProducts = await myProduct.find({})
        return res.status(200).json({
            status: true,
            myProducts: myProducts
        })

    } catch (error) {
        return res.status(404).json({
            status: false,
            message: "products not found"
        })

    }

})




// find by id


myApp.get("/myProducts/:id", async (req, res) => {

    const id = req.params.id;
    try {
        const product = await myProduct.findById(id);
        return res.status(200).json({
            status: true,
            product: product
        })
    } catch (error) {
        return res.status(404).json({
            status: false,
            message: "Product not found"
        })
    }
})








// update product


myApp.put("/myProducts/:id", upload.single('image'), async (req, res) => {
    const id = req.params.id;

    const extension = req.file.mimetype.split("/")[1];
    if (extension == "png" || extension == "jpg" || extension == "jpeg") {
        const fileNmae = req.file.filename + "." + extension;
        console.log(fileNmae);
        req.body.image = fileNmae

        fs.rename(req.file.path, `uploads/${fileNmae}`, () => {
            console.log("\nFile Renamed!\n");
        });
        

        const oldproduct = await myProduct.findById(id);

        console.log(oldproduct);

        fs.unlink(`uploads/${oldproduct.image}`, () => console.log("file deleted"))
        console.log(req.file.path);

    } else {
        fs.unlink(req.file.path, () => console.log("file deleted"))
        return res.json({
            message: "only images are accepted"
        })
    }



    try {
        const updateproduct = await myProduct.findByIdAndUpdate(id, req.body,
            {
                runValidators: true,
                new: true
            }
        );
        return res.status(200).json({
            status: true,
            updateproduct: updateproduct,
            message: "product succesfully updated"
        })

    } catch (error) {
        if (error.name === 'ValidationError') {
            // Mongoose validation error
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }

            res.status(200).json({
                status: false,
                errors: errors
            });
        } else {
            // Other types of errors
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});







// create product
myApp.post('/myProducts', upload.single('image'), async (req, res) => {
    try {


        const extension = req.file.mimetype.split("/")[1];
        if (extension == "png" || extension == "jpg" || extension == "jpeg") {
            const fileNmae = req.file.filename + "." + extension;
            req.body.image = fileNmae

            fs.rename(req.file.path, `uploads/${fileNmae}`, () => {
                console.log("\nFile Renamed!\n");


            });
        } else {
            fs.unlink(req.file.path, () => console.log("file deleted"))
            return res.json({
                message: "only images are accepted"
            })
        }

        const creatProdut = await myProduct.create(req.body);
        res.status(201).json({
            status: true,
            creatProdut: creatProdut,
            message: 'product created'
        })
    } catch (error) {

        if (error.name === 'ValidationError') {
            // Mongoose validation error
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            res.status(200).json({
                status: false,
                errors: errors
            });
        } else {
            // Other types of errors
            res.status(500).json({ error: 'Internal Server Error' });
        }


    }
})




// delete by id
myApp.delete("/myProducts/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id)
    

       
      
    try {
        const oldproduct = await myProduct.findById(id);


        await myProduct.findByIdAndDelete(id);
        fs.unlink(`uploads/${oldproduct.image}`, () => console.log("file deleted"))
    
     res.status(200).json({
            status: true,
            message: "product succesfully deleted"
        })

        
    } catch (error) {
        return res.status(404).json({
            status: false,
            message: "something went wrong"
        })
    }
});




mongoose.connect("mongodb://127.0.0.1:27017/MyDataBase").then(() => {
    myApp.listen(4002, () => {
        console.log("data base connect to server")
    })
})
