const mongoose = require('mongoose');

const QueueAssistancePackageSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please add a package name'] 
  },
  description: { 
    type: String, 
    required: [true, 'Please add a description'] 
  },
  price: { 
    type: Number, 
    required: [true, 'Please add a price'] 
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  order: { // For controlling display order on the frontend
    type: Number, 
    default: 0 
  },
});

module.exports = mongoose.model('QueueAssistancePackage', QueueAssistancePackageSchema);