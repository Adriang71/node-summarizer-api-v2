const mongoose = require('mongoose');
require('dotenv').config();

async function fixLanguage() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const AIConfigModel = mongoose.model('AIConfig', new mongoose.Schema({
      userId: String,
      modelId: String,
      promptId: String,
      language: String,
      maxContentLength: Number,
      enableCaching: Boolean,
      cacheExpiration: Number
    }));

    // Mapowanie promptId na język
    const promptLanguageMap = {
      'analysis-en': 'en',
      'analysis-pl': 'pl'
    };

    const configs = await AIConfigModel.find({});
    console.log(`Found ${configs.length} configurations to check`);

    for (const config of configs) {
      const correctLanguage = promptLanguageMap[config.promptId];
      if (correctLanguage && config.language !== correctLanguage) {
        await AIConfigModel.updateOne(
          { _id: config._id },
          { language: correctLanguage }
        );
        console.log(`Fixed user ${config.userId}: promptId="${config.promptId}" -> language="${correctLanguage}"`);
      }
    }

    console.log('Language fix completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixLanguage(); 