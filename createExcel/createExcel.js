const express = require('express');
const app = express();
const fs = require('fs');
const ExcelJS = require('exceljs');
const DIRECTORY_PATH = '../client/public';
const FILE_NAME = 'data.xlsx'; // Name of the Excel file
const FILE_PATH = `${DIRECTORY_PATH}/${FILE_NAME}`;

const addExcelData= async (req, res) => {
    try {
        // Create a new workbook
        console.log("line 11 "+req.body)
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // Add columns
        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Signal Time', key: 'signalTime', width: 20 },
            { header: 'Symbol', key: 'symbol', width: 10 },
            { header: 'Quantity', key: 'quantity', width: 10 },
            { header: 'Entry Price', key: 'entryPrice', width: 15 },
            { header: 'Exit', key: 'exit', width: 10 },
            { header: 'P&L', key: 'pl', width: 10 }
        ];

        // Generate new data (for demonstration)
        const newData = [
            req.body
            // Add your data here
        ];

        // Add new data to the worksheet
        newData.forEach((data, index) => {
            worksheet.addRow({ ...data, no: index + 1 });
        });

        // Write the workbook to the file
        await workbook.xlsx.writeFile(FILE_PATH);

        res.status(200).json({ message: 'Data added successfully.' });
    } catch (error) {
        console.error('Error adding data:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

app.get('/download-excel', (req, res) => {
    try {
        // Check if the file exists
        if (fs.existsSync(FILE_PATH)) {
            // Send the file as attachment
            res.download(FILE_PATH, 'data.xlsx');
        } else {
            res.status(404).json({ error: 'File not found.' });
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports=addExcelData;
