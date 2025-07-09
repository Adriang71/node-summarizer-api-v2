import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { WebContent } from '../types';

export class WebScraperService {
  private static readonly TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '30000');
  private static readonly MAX_CONTENT_LENGTH = parseInt(process.env.MAX_CONTENT_LENGTH || '10485760');

  /**
   * Fetches and parses HTML content from a website
   */
  static async scrapeWebsite(url: string): Promise<WebContent> {
    try {
      // URL validation
      const validUrl = this.validateUrl(url);
      
      // Fetch content
      const response: AxiosResponse = await axios.get(validUrl, {
        timeout: this.TIMEOUT,
        maxContentLength: this.MAX_CONTENT_LENGTH,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      // Parse HTML
      const $ = cheerio.load(response.data);
      
      // Extract title
      const title = $('title').text().trim() || 
                   $('h1').first().text().trim() || 
                   'No title';

      // Extract main content
      const content = this.extractMainContent($);

      return {
        title,
        content,
        url: validUrl
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout exceeded');
        }
        if (error.response?.status === 404) {
          throw new Error('Page not found (404)');
        }
        if (error.response?.status === 403) {
          throw new Error('Access forbidden (403)');
        }
        throw new Error(`Error fetching page: ${error.message}`);
      }
      throw new Error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates and normalizes URL
   */
  private static validateUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Check if it's HTTP/HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('URL must use HTTP or HTTPS protocol');
      }

      return urlObj.toString();
    } catch (error) {
      throw new Error('Invalid URL format');
    }
  }

  /**
   * Extracts main content from HTML
   */
  private static extractMainContent($: cheerio.CheerioAPI): string {
    // Remove unnecessary elements
    $('script, style, nav, header, footer, aside, .advertisement, .ads, .sidebar').remove();
    
    // Priority selectors for main content
    const contentSelectors = [
      'main',
      'article',
      '.content',
      '.main-content',
      '.post-content',
      '.entry-content',
      '#content',
      '#main'
    ];

    let content = '';

    // Try to find main content
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        if (content.length > 100) break; // If meaningful content found
      }
    }

    // If no main content found, use body
    if (!content || content.length < 100) {
      content = $('body').text().trim();
    }

    // Clean text
    return this.cleanText(content);
  }

  /**
   * Cleans and normalizes text
   */
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Remove multiple spaces
      .replace(/\n+/g, '\n') // Remove multiple newlines
      .replace(/\t+/g, ' ') // Replace tabs with spaces
      .trim()
      .substring(0, 10000); // Limit text length
  }
} 