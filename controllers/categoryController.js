const Category = require('../models/Category');

// create a new category 

const createCategory = async (req, res)=>{
    try {
        const {name, description} = req.body;

        if(!name) return res.status(400).json({success:false , message:'name is required'});
        const existingCategory = await Category.findOne({name});
        if(existingCategory) return res.status(400).json({success:false, message: 'category already exists'})

         const category = await Category.create({ name, description });

        res.status(201).json({success:true, category});


    } catch(error){
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}

const deleteCategory = async (req,res)=>{
    try{
        const category = await Category.findByIdAndDelete(req.params.id);
        if(!category) return res.status(404).json({success:false, message: 'not found'})
    }catch(error){
        res.status(500).json({success: false, error: error.message})
    }
}

module.exports = {
    createCategory,
    deleteCategory
}