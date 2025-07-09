const mongoose = require('mongoose');
require('dotenv').config();

async function fixOldModels() {
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

    // Mapowanie starych modeli na nowe
    const modelMapping = {
      'llama-3-8b': 'qwen-7b',
      'deepseek-coder': 'qwen-7b',
      'gemma-7b': 'qwen-7b',
      'gemma-2b': 'qwen-7b',
      'phi-3-mini': 'qwen-7b',
      'phi-3-small': 'qwen-7b'
    };

    // Znajdź wszystkie konfiguracje ze starymi modelami
    const oldConfigs = await AIConfigModel.find({
      modelId: { $in: Object.keys(modelMapping) }
    });

    console.log(`Found ${oldConfigs.length} configurations with old models`);

    // Zaktualizuj każdą konfigurację
    for (const config of oldConfigs) {
      const newModelId = modelMapping[config.modelId];
      if (newModelId) {
        await AIConfigModel.updateOne(
          { _id: config._id },
          { modelId: newModelId }
        );
        console.log(`Updated user ${config.userId}: ${config.modelId} -> ${newModelId}`);
      }
    }

    // Sprawdź wszystkie konfiguracje
    const allConfigs = await AIConfigModel.find({});
    console.log('\nAll configurations after update:');
    allConfigs.forEach(config => {
      console.log(`User ${config.userId}: modelId="${config.modelId}", promptId="${config.promptId}", language="${config.language}"`);
    });

    console.log('\nMigration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixOldModels(); 