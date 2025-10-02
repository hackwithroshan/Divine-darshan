const mongoose = require('mongoose');

const QueueAssistanceAddOnSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please add an add-on name'] 
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
  type: { // Programmatic key for the addon
    type: String, 
    enum: ['guide', 'pickup', 'poojaItems'], 
    required: true, 
    unique: true 
  },
});

module.exports = mongoose.model('QueueAssistanceAddOn', QueueAssistanceAddOnSchema);