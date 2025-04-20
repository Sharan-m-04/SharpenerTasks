const getAllProducts = (req, res) => {
    res.send("Fetching all products");
  };
  
  const addProduct = (req, res) => {
    res.send("Adding a new product");
  };
  
  const getProductById = (req, res) => {
    const { id } = req.params;
    res.send(`Fetching product with ID: ${id}`);
  };
  
  module.exports = {
    getAllProducts,
    addProduct,
    getProductById
  };
  