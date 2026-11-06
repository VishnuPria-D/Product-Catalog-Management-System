const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'all') {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message || 'Failed to fetch product' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, quantity, description, image } = req.body;

    if (!name || price === undefined || !category || quantity === undefined) {
      return res.status(400).json({
        message: 'Name, price, category, and quantity are required',
      });
    }

    const product = await Product.create({
      name,
      price: Number(price),
      category,
      quantity: Number(quantity),
      description: description || '',
      image: image || '',
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, price, category, quantity, description, image } = req.body;

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image;

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message || 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message || 'Failed to delete product' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const categories = await Product.distinct('category');
    res.json({
      totalProducts,
      totalCategories: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch stats' });
  }
};
