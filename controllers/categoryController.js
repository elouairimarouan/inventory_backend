const Category = require('../models/Category');
const logActivity  = require('../utils/activityLogger');
const paginate = require('../utils/paginate');
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../config/pagination');


// create a new category 

const createCategory = async (req, res)=>{
    try {
        const {name, description} = req.body;

        if(!name) return res.status(400).json({success:false , message:'name is required'});
        const existingCategory = await Category.findOne({name});
        if(existingCategory) return res.status(400).json({success:false, message: 'category already exists'})

         const category = await Category.create({ name, description });

       
        await logActivity({
               userId: req.user?.id,
               action: "CREATE",
               entity: "Category",
               entityId: category._id,
               newData: { name , description},     
               ipAddress: req.ip,
               fullName: `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim()
             });

        console.log(logActivity);

        res.status(201).json({success:true, category});


    } catch(error){
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${req.params.id} not found`,
      });
    }

    await category.deleteOne();

    // 🧾 Log the delete action
    await logActivity({
      userId: req.user?.id,
      fullName: `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
      action: 'DELETE',
      entity: 'Category',
      entityId: category._id,
      oldData: { name: category.name, description: category.description },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Category "${category.name}" deleted successfully`,
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const { search = '', page, limit } = req.query;

    // Live search query: search by name or description
    const query = search
      ? { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    // Call paginate utility
    const result = await paginate(Category, query, { 
      page: page || DEFAULT_PAGE, 
      limit: limit || DEFAULT_LIMIT 
    });

    res.status(200).json(result);

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


module.exports = {
    createCategory,
    deleteCategory,
    getAllCategories
}