const mongoose = require('mongoose');
require('dotenv').config();

async function updateToQwen() {
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

    // Aktualizuj wszystkich użytkowników na model Qwen 7B
    const result = await AIConfigModel.updateMany(
      {},
      { modelId: 'qwen-7b' }
    );

    console.log(`Updated ${result.modifiedCount} configurations to use Qwen 7B model`);

    // Sprawdź aktualne konfiguracje
    const configs = await AIConfigModel.find({});
    console.log('Current configurations:');
    configs.forEach(config => {
      console.log(`User ${config.userId}: modelId="${config.modelId}", promptId="${config.promptId}", language="${config.language}"`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateToQwen(); 