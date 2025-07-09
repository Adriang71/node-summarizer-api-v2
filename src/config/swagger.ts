import joiToSwagger from 'joi-to-swagger';
import Joi from 'joi';

// Import schemas from routes
import { registerSchema, loginSchema } from '../routes/auth';
import { analyzeSchema } from '../routes/analysis';
import { 
  updateConfigSchema, 
  aiConfigResponseSchema, 
  aiModelsResponseSchema, 
  aiPromptsResponseSchema, 
  updateConfigResponseSchema,
  aiModelSchema,
  aiPromptSchema
} from '../routes/ai';

// Convert Joi schemas to Swagger
const { swagger: registerSwagger } = joiToSwagger(registerSchema);
const { swagger: loginSwagger } = joiToSwagger(loginSchema);
const { swagger: analyzeSwagger } = joiToSwagger(analyzeSchema);
const { swagger: updateConfigSwagger } = joiToSwagger(updateConfigSchema);
const { swagger: aiConfigResponseSwagger } = joiToSwagger(aiConfigResponseSchema);
const { swagger: aiModelsResponseSwagger } = joiToSwagger(aiModelsResponseSchema);
const { swagger: aiPromptsResponseSwagger } = joiToSwagger(aiPromptsResponseSchema);
const { swagger: updateConfigResponseSwagger } = joiToSwagger(updateConfigResponseSchema);
const { swagger: aiModelSwagger } = joiToSwagger(aiModelSchema);
const { swagger: aiPromptSwagger } = joiToSwagger(aiPromptSchema);

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Web Analyzer API',
    description: 'API for analyzing websites using AI and generating speech synthesis',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      UserRegistration: registerSwagger,
      UserLogin: loginSwagger,
      AnalyzeRequest: analyzeSwagger,
      UpdateConfigRequest: updateConfigSwagger,
      AIModel: aiModelSwagger,
      AIPrompt: aiPromptSwagger,
      AIConfigResponse: aiConfigResponseSwagger,
      AIModelsResponse: aiModelsResponseSwagger,
      AIPromptsResponse: aiPromptsResponseSwagger,
      UpdateConfigResponse: updateConfigResponseSwagger,
      AnalysisResult: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
            description: 'Brief summary of the page'
          },
          keyPoints: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Key points from the analysis'
          },
          sentiment: {
            type: 'string',
            enum: ['positive', 'negative', 'neutral'],
            description: 'Sentiment analysis result'
          },
          wordCount: {
            type: 'number',
            description: 'Number of words in the content'
          }
        }
      },
      AudioResult: {
        type: 'object',
        properties: {
          audioUrl: {
            type: 'string',
            description: 'URL to the generated audio file'
          },
          audioId: {
            type: 'string',
            description: 'Unique identifier for the audio'
          },
          duration: {
            type: 'number',
            description: 'Duration of the audio in seconds'
          }
        }
      },
      AnalyzeResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean'
          },
          data: {
            type: 'object',
            properties: {
              url: {
                type: 'string'
              },
              analysis: {
                $ref: '#/components/schemas/AnalysisResult'
              },
              audio: {
                $ref: '#/components/schemas/AudioResult'
              },
              timestamp: {
                type: 'string',
                format: 'date-time'
              }
            }
          },
          cached: {
            type: 'boolean'
          },
          error: {
            type: 'string'
          }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean'
          },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string'
                  },
                  email: {
                    type: 'string'
                  },
                  name: {
                    type: 'string'
                  }
                }
              },
              token: {
                type: 'string'
              }
            }
          },
          error: {
            type: 'string'
          }
        }
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        description: 'Create a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserRegistration'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse'
                }
              }
            }
          },
          '400': {
            description: 'Bad request - validation error'
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        description: 'Authenticate user and get JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserLogin'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse'
                }
              }
            }
          },
          '401': {
            description: 'Invalid credentials'
          }
        }
      }
    },
    '/api/analyze': {
      post: {
        tags: ['Analysis'],
        summary: 'Analyze a website',
        description: 'Analyze website content using AI and generate speech synthesis',
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AnalyzeRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Analysis completed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AnalyzeResponse'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - token required'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/history': {
      get: {
        tags: ['Analysis'],
        summary: 'Get analysis history',
        description: 'Retrieve analysis history for the authenticated user',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            description: 'Number of results to return (max 100)',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10
            }
          }
        ],
        responses: {
          '200': {
            description: 'History retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean'
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string'
                          },
                          url: {
                            type: 'string'
                          },
                          analysis: {
                            $ref: '#/components/schemas/AnalysisResult'
                          },
                          audio: {
                            $ref: '#/components/schemas/AudioResult'
                          },
                          timestamp: {
                            type: 'string',
                            format: 'date-time'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - token required'
          }
        }
      }
    },
    '/api/analysis/{id}': {
      get: {
        tags: ['Analysis'],
        summary: 'Get specific analysis',
        description: 'Retrieve a specific analysis by ID',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Analysis ID',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Analysis retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string'
                        },
                        url: {
                          type: 'string'
                        },
                        analysis: {
                          $ref: '#/components/schemas/AnalysisResult'
                        },
                        audio: {
                          $ref: '#/components/schemas/AudioResult'
                        },
                        timestamp: {
                          type: 'string',
                          format: 'date-time'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Analysis not found'
          }
        }
      },
      delete: {
        tags: ['Analysis'],
        summary: 'Delete analysis',
        description: 'Delete a specific analysis by ID',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Analysis ID',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Analysis deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean'
                    },
                    message: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Analysis not found'
          }
        }
      }
    },
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Check if the server is running properly',
        responses: {
          '200': {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean'
                    },
                    message: {
                      type: 'string'
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/ai/config': {
      get: {
        tags: ['AI Configuration'],
        summary: 'Get current AI configuration',
        description: 'Retrieves the current AI configuration including model, prompt, and settings',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'AI configuration retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AIConfigResponse'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - Invalid or missing JWT token'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      },
      put: {
        tags: ['AI Configuration'],
        summary: 'Update AI configuration',
        description: 'Updates the AI configuration with new model, prompt, or settings',
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateConfigRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'AI configuration updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UpdateConfigResponse'
                }
              }
            }
          },
          '400': {
            description: 'Bad request - Invalid configuration parameters'
          },
          '401': {
            description: 'Unauthorized - Invalid or missing JWT token'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/ai/models': {
      get: {
        tags: ['AI Configuration'],
        summary: 'Get available AI models',
        description: 'Retrieves a list of all available AI models with their configurations',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Available AI models retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AIModelsResponse'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - Invalid or missing JWT token'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/ai/prompts': {
      get: {
        tags: ['AI Configuration'],
        summary: 'Get available AI prompts',
        description: 'Retrieves a list of all available prompt templates with their configurations',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Available AI prompts retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AIPromptsResponse'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - Invalid or missing JWT token'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    }
  }
}; 