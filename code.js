/**
 * Google Apps Script for Elector Data Portal
 * Sheet Name must be "Data"
 * Columns: Epic Number, AC No., Part No., Serial No, Elector's Name, Elector Name Hindi, Elector Gender, Age, D.O.B, Relative Name, Relative Name Hindi, Relative type, Mobile Number
 */

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Sheet 'Data' not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const epicNumber = e.parameter.epicNumber;
  if (!epicNumber) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Missing epicNumber parameter" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  // Find the record
  const epicIndex = headers.indexOf("Epic Number");
  const record = rows.find(row => row[epicIndex] == epicNumber);

  if (!record) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Record not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const mappedRecord = mapRowToEntity(headers, record);

  return ContentService.createTextOutput(JSON.stringify({ success: true, data: mappedRecord }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Sheet 'Data' not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Invalid JSON body" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const { epicNumber, mobileNumber } = body;

  if (!epicNumber) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Missing epicNumber" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const epicIndex = headers.indexOf("Epic Number");
  const mobileIndex = headers.indexOf("Mobile Number");

  for (let i = 1; i < data.length; i++) {
    if (data[i][epicIndex] == epicNumber) {
      sheet.getRange(i + 1, mobileIndex + 1).setValue(mobileNumber);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Mobile number updated" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Record not found" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function mapRowToEntity(headers, row) {
  const entity = {};
  const mapping = {
    "Epic Number": "epicNumber",
    "AC No.": "acNo",
    "Part No.": "partNo",
    "Serial No": "serialNo",
    "Elector's Name": "electorName",
    "Elector Name Hindi": "electorNameHindi",
    "Elector Gender": "electorGender",
    "Age": "age",
    "D.O.B": "dob",
    "Relative Name": "relativeName",
    "Relative Name Hindi": "relativeNameHindi",
    "Relative type": "relativeType",
    "Mobile Number": "mobileNumber"
  };

  headers.forEach((header, index) => {
    const key = mapping[header];
    if (key) {
      entity[key] = row[index] || "";
    }
  });

  return entity;
}
