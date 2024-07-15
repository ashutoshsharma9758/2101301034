const express = require('express');
const app = express();
const axios = require('axios');
const port = 8080;
const url= 'http://20.244.56.144/test';
const access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIxMDMzNjQwLCJpYXQiOjE3MjEwMzMzNDAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjUwYWJkY2Y1LTIzZGUtNDUwYy05MWJmLTU0MzE3NzA5NDQyZiIsInN1YiI6ImFzaHV0b3Noc2hhcm1hMTgxMjIwMDRAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoicXVhbnR1bSIsImNsaWVudElEIjoiNTBhYmRjZjUtMjNkZS00NTBjLTkxYmYtNTQzMTc3MDk0NDJmIiwiY2xpZW50U2VjcmV0IjoiR1pXdUh6SmhSZXJBUVlrdiIsIm93bmVyTmFtZSI6ImFzaHV0b3NoIiwib3duZXJFbWFpbCI6ImFzaHV0b3Noc2hhcm1hMTgxMjIwMDRAZ21haWwuY29tIiwicm9sbE5vIjoiMSJ9.p2pwKhSe-mb05UpwFhd2wAgjuB_58jWv2pOzyGTLP3k';

const fetchData = async(company, category, top, minPrice, maxPrice) => {
    try{
        const response=await axios.get(`${url}/companies/${company}/categories/${category}/products`,
            {
            params:{top, minPrice, maxPrice},
            headers:{'Authorization':`Bearer ${access_token}`}
        });
        return response.data.products;
    }catch (error) {
        console.error(`Error fetching data from ${company}:`, error);
        return [];
    }
};


app.get('/categories/:categoryname/products', async (req, res) => {
    const { categoryname } = req.params;
    let { n, page, sort, order, minPrice, maxPrice } = req.query;
    n = parseInt(n) || 10;
    page = parseInt(page) || 1;
    order = order === 'desc' ? -1 : 1;

    if (n > 10) {
        return res.status(400).send("Pagination required for more than 10 products per page.");
    }

    try {
        const companies=['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];
        let products=[];

        for (let company of companies) {
            const data= await fetchData(company, categoryname, n, minPrice, maxPrice);
            products= products.concat(data);
        }

        // soting the  product
        if (sort) {
            products.sort((a, b) => (a[sort]>b[sort] ? 1 : -1)*order);
        }

        const startIndex = (page - 1)*n;
        const endIndex = startIndex + n;
        const paginatedProducts = products.slice(startIndex, endIndex);

        res.json({ products: paginatedProducts });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/categories/:categoryname/products/:productid', async (req, res) => {
    const { categoryname, productid } = req.params;

    try {
        const companies =['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];
        let productDetails= null;

        for (let company of companies) {
            const data = await fetchData(company, categoryname, 10, 0, 100000); // assume the large price range
           productDetails = data.find(product => generateUniqueId(product) === productid);
            if (productDetails) break;
        }

        if(productDetails) {
            res.json(productDetails);
        }
        else{
            res.status(404).send('Product not found');
        }
    } catch(error) {
        console.error('Error fetching product details:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});