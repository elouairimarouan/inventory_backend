const Category = require('../models/Category');

// create a new category 

const createCategory = async (req, res)=>{
    try {
        const {name, description} = req.body;

        if(!name) return res.status(400).json({success:false , message:'name is required'});
        const existingCategory = await Category.findOne({name});
        if(existingCategory) return res.status(400).json({success:false, message: 'category already exists'})

        const category = new Category({name,description});
        await category.save();
        res.status(201).json({success:true, success: true});


    } catch(error){
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}

module.exports = {
    createCategory,
}