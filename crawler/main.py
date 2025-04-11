import requests
from bs4 import BeautifulSoup
import re
import json
import os
from datetime import datetime
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import wikipedia
import pubmed_parser as pp
from sklearn.feature_extraction.text import TfidfVectorizer
import logging
import time
from dotenv import load_dotenv
import pandas as pd


# Import Springer Nature API client
import springernature_api_client.metadata as metadata
import springernature_api_client.openaccess as openaccess
import springernature_api_client.meta as meta
import springernature_api_client.tdm as tdm

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("crawler.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Download NLTK resources
nltk.download('punkt')
nltk.download('stopwords')

class ScienceCrawler:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.data_dir = os.path.join(os.getcwd(), 'data')
        os.makedirs(self.data_dir, exist_ok=True)
        
        # API keys
        self.pubmed_api_key = os.getenv('PUBMED_API_KEY')
        self.springer_api_key = os.getenv('SPRINGER_API_KEY')
        self.nature_api_key = os.getenv('NATURE_API_KEY')
        
        # Initialize Springer API clients
        try:
            self.springer_openaccess = openaccess.OpenAccessAPI(api_key=self.springer_api_key)
            self.springer_metadata = metadata.MetadataAPI(api_key=self.springer_api_key)
            logger.info("Springer API clients initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Springer API clients: {str(e)}")
            self.springer_openaccess = None
            self.springer_metadata = None
        
    def extract_keywords(self, topic):
        """Extract relevant keywords from the topic"""
        # Tokenize, lowercase, remove stop words
        word_tokens = word_tokenize(topic.lower())
        keywords = [w for w in word_tokens if w.isalnum() and w not in self.stop_words]

        # Thêm topic nếu nó là một cụm có nhiều từ, và chưa nằm trong keywords
        if len(word_tokens) > 1 and topic.lower() not in keywords:
            keywords.append(topic.lower())

        # Loại bỏ trùng lặp, giữ thứ tự
        keywords = list(dict.fromkeys(keywords))

        logger.info(f"Extracted keywords: {keywords}")
        return keywords

    def search_wikipedia(self, keywords):
        """Search Wikipedia for the given keywords"""
        try:
            # Normalize keywords: remove duplicates, lowercase
            unique_keywords = list(dict.fromkeys([kw.lower() for kw in keywords]))
            main_topic = ' '.join(unique_keywords[:3]) if len(unique_keywords) > 3 else ' '.join(unique_keywords)
            
            logger.info(f"Searching Wikipedia for main topic: {main_topic}")
            
            # Tìm danh sách các tiêu đề liên quan
            search_results = wikipedia.search(main_topic)
            wiki_page = None

            # Ưu tiên trang có tiêu đề trùng khớp chính xác
            for title in search_results:
                if title.lower() == main_topic.lower():
                    try:
                        wiki_page = wikipedia.page(title)
                        break
                    except:
                        continue

            # Nếu không có tiêu đề trùng chính xác, lấy trang đầu tiên hợp lệ
            if not wiki_page:
                for title in search_results:
                    try:
                        wiki_page = wikipedia.page(title)
                        break
                    except:
                        continue

            if not wiki_page:
                return {
                    'source': 'wikipedia',
                    'error': f"No valid Wikipedia page found for '{main_topic}'"
                }

            # Lấy nội dung chính
            content = wiki_page.content
            url = wiki_page.url

            # Lấy các trang liên quan
            related_pages = []
            for link in wiki_page.links[:5]:
                try:
                    related_page = wikipedia.page(link)
                    related_pages.append({
                        'title': related_page.title,
                        'summary': wikipedia.summary(link, sentences=3),
                        'url': related_page.url
                    })
                except:
                    continue

            return {
                'source': 'wikipedia',
                'title': wiki_page.title,
                'content': content,
                'url': url,
                'related_pages': related_pages
            }

        except Exception as e:
            logger.error(f"Wikipedia search error: {str(e)}")
            return {
                'source': 'wikipedia',
                'error': str(e)
            }


    def search_pubmed(self, keywords):
        """Search PubMed for scientific articles"""
        try:
            query = ' AND '.join(keywords[:5])  # Limit to first 5 keywords
            
            # PubMed API endpoint
            url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
            params = {
                'db': 'pubmed',
                'term': query,
                'retmode': 'json',
                'retmax': 5,  # Get top 5 results
                'api_key': self.pubmed_api_key
            }
            
            response = requests.get(url, params=params)
            data = response.json()
            
            if 'esearchresult' in data and 'idlist' in data['esearchresult']:
                article_ids = data['esearchresult']['idlist']
                
                # Fetch article details
                articles = []
                for article_id in article_ids:
                    article_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
                    article_params = {
                        'db': 'pubmed',
                        'id': article_id,
                        'retmode': 'xml',
                        'api_key': self.pubmed_api_key
                    }
                    
                    article_response = requests.get(article_url, params=article_params)
                    
                    # Parse XML
                    if article_response.status_code == 200:
                        article_data = pp.parse_xml_web(article_response.text)
                        
                        # Extract abstract if available
                        abstract = article_data.get('abstract', 'No abstract available')
                        
                        articles.append({
                            'id': article_id,
                            'title': article_data.get('title', ''),
                            'abstract': abstract,
                            'url': f"https://pubmed.ncbi.nlm.nih.gov/{article_id}/",
                            'authors': article_data.get('authors', []),
                            'journal': article_data.get('journal', ''),
                            'publication_date': article_data.get('publication_date', '')
                        })
                
                return {
                    'source': 'pubmed',
                    'articles': articles
                }
            else:
                return {
                    'source': 'pubmed',
                    'articles': []
                }
                
        except Exception as e:
            logger.error(f"PubMed search error: {str(e)}")
            return {
                'source': 'pubmed',
                'error': str(e)
            }

    # def search_springer(self, keywords):
    #     """Search Springer Nature for scientific articles using their API"""
    #     if not self.springer_metadata or not self.springer_openaccess:
    #         logger.warning("Springer API clients not initialized, skipping Springer search")
    #         return {
    #             'source': 'springer',
    #             'articles': []
    #         }
            
    #     try:
    #         # Create query string - trying different formats
    #         # Format 1: Simple keyword search
    #         query1 = ' '.join(keywords[:5])
            
    #         # Format 2: Title-specific search
    #         query2 = f'("{keywords[0]}")' if keywords else ""
    #         for kw in keywords[1:3]:  # Add up to 3 keywords
    #             if kw:
    #                 query2 += f' AND ("{kw}")'
            
    #         # Try both queries and use the one with more results
    #         try:
    #             metadata_response1 = self.springer_metadata.search(q=query1, p=10, s=1, fetch_all=False)
    #             openaccess_response1 = self.springer_openaccess.search(q=query1, p=5, s=1, fetch_all=False)
                
    #             metadata_response2 = self.springer_metadata.search(q=query2, p=10, s=1, fetch_all=False)
    #             openaccess_response2 = self.springer_openaccess.search(q=query2, p=5, s=1, fetch_all=False)
                
    #             # Choose better query based on total results
    #             if metadata_response1.get('result', [{}])[0].get('total', 0) > metadata_response2.get('result', [{}])[0].get('total', 0):
    #                 metadata_response = metadata_response1
    #                 openaccess_response = openaccess_response1
    #             else:
    #                 metadata_response = metadata_response2
    #                 openaccess_response = openaccess_response2
                    
    #         except Exception as e:
    #             # If comparison fails, default to first query
    #             logger.warning(f"Error comparing Springer queries: {str(e)}")
    #             metadata_response = self.springer_metadata.search(q=query1, p=10, s=1, fetch_all=False)
    #             openaccess_response = self.springer_openaccess.search(q=query1, p=5, s=1, fetch_all=False)
            
    #         # Process metadata results
    #         articles = []
            
    #         # Process metadata results (general article info)
    #         if 'result' in metadata_response and len(metadata_response['result']) > 0:
    #             records = metadata_response['result'][0].get('records', [])
                
    #             for record in records:
    #                 article = {
    #                     'title': record.get('title', ''),
    #                     'doi': record.get('doi', ''),
    #                     'url': record.get('url', [{}])[0].get('value', ''),
    #                     'publication_date': record.get('publicationDate', ''),
    #                     'abstract': record.get('abstract', ''),
    #                     'journal': record.get('publicationName', ''),
    #                     'publisher': record.get('publisher', ''),
    #                     'content_type': record.get('contentType', '')
    #                 }
                    
    #                 # Add authors if available
    #                 if 'creators' in record:
    #                     article['authors'] = [creator.get('creator', '') for creator in record['creators']]
                    
    #                 articles.append(article)
            
    #         # Process open access results (full text content)
    #         if 'result' in openaccess_response and len(openaccess_response['result']) > 0:
    #             oa_records = openaccess_response['result'][0].get('records', [])
                
    #             for oa_record in oa_records:
    #                 # Try to match with existing metadata records by DOI
    #                 doi = oa_record.get('doi', '')
    #                 matched = False
                    
    #                 for i, article in enumerate(articles):
    #                     if article.get('doi') == doi:
    #                         # Add full text to existing article
    #                         articles[i]['full_text'] = oa_record.get('fullText', '')
    #                         matched = True
    #                         break
                    
    #                 # If no match found, add as new article
    #                 if not matched:
    #                     new_article = {
    #                         'title': oa_record.get('title', ''),
    #                         'doi': doi,
    #                         'url': oa_record.get('url', [{}])[0].get('value', ''),
    #                         'full_text': oa_record.get('fullText', ''),
    #                         'source': 'springer_openaccess'
    #                     }
    #                     articles.append(new_article)
            
    #         return {
    #             'source': 'springer',
    #             'articles': articles
    #         }
            
    #     except Exception as e:
    #         logger.error(f"Springer search error: {str(e)}")
    #         return {
    #             'source': 'springer',
    #             'error': str(e)
    #         }
    
    def search_springer(self, keywords):
        """Search Springer Nature for scientific articles using their API"""
        if not self.springer_metadata or not self.springer_openaccess:
            logger.warning("Springer API clients not initialized, skipping Springer search")
            return {
                'source': 'springer',
                'articles': []
            }
                
        try:
            # Join keywords with spaces for a simple search
            keyword_string = ' '.join(keywords[:5])
            
            # Create query string with proper format
            query = f"keyword: {keyword_string}"
            
            # Get responses from both endpoints
            try:
                # For metadata API
                metadata_response = self.springer_metadata.search(q=query, p=10, s=1, fetch_all=False)
                
                # For open access API
                openaccess_response = self.springer_openaccess.search(q=query, p=5, s=1, fetch_all=False)
                    
            except Exception as e:
                logger.warning(f"Error in Springer API search: {str(e)}")
                return {
                    'source': 'springer',
                    'articles': []
                }
            
            # Process metadata results
            articles = []
            
            # Process metadata results (general article info)
            if 'records' in metadata_response:
                records = metadata_response.get('records', [])
                
                for record in records:
                    article = {
                        'title': record.get('title', ''),
                        'doi': record.get('doi', ''),
                        'url': record.get('url', [{}])[0].get('value', '') if record.get('url') else '',
                        'publication_date': record.get('publicationDate', ''),
                        'abstract': record.get('abstract', ''),
                        'journal': record.get('publicationName', ''),
                        'publisher': record.get('publisher', ''),
                        'content_type': record.get('contentType', '')
                    }
                    
                    # Add authors if available
                    if 'creators' in record:
                        article['authors'] = [creator.get('creator', '') for creator in record['creators']]
                    
                    articles.append(article)
            
            # Process open access results (full text content)
            if 'records' in openaccess_response:
                oa_records = openaccess_response.get('records', [])
                
                for oa_record in oa_records:
                    # Try to match with existing metadata records by DOI
                    doi = oa_record.get('doi', '')
                    matched = False
                    
                    for i, article in enumerate(articles):
                        if article.get('doi') == doi:
                            # Add full text to existing article
                            articles[i]['full_text'] = oa_record.get('fullText', '')
                            matched = True
                            break
                    
                    # If no match found, add as new article
                    if not matched:
                        new_article = {
                            'title': oa_record.get('title', ''),
                            'doi': doi,
                            'url': oa_record.get('url', [{}])[0].get('value', '') if oa_record.get('url') else '',
                            'full_text': oa_record.get('fullText', ''),
                            'source': 'springer_openaccess'
                        }
                        articles.append(new_article)
            
            return {
                'source': 'springer',
                'articles': articles
            }
        except Exception as e:
            logger.warning(f"Error in Springer search: {str(e)}")
            return {
                'source': 'springer',
                'articles': []
            }
        
    def clean_text(self, text):
        if not text:
            return ""
        # Remove HTML tags
        text = re.sub(r'<.*?>', '', text)
        # Remove everything except word characters, whitespace, and .!? (for sentence boundaries)
        text = re.sub(r'[^\w\s\.\!\?]', ' ', text)
        # Collapse multiple spaces into one
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text

    def extract_relevant_content(self, data, keywords):
        """Extract most relevant content from the data"""
        all_content = []
        
        # Extract content from Wikipedia
        wiki_data = next((item for item in data if item['source'] == 'wikipedia'), None)
        if wiki_data:
            if 'content' in wiki_data:
                all_content.append(wiki_data['content'])
            if 'search_results' in wiki_data:
                for result in wiki_data['search_results']:
                    all_content.append(result.get('summary', ''))
            if 'related_pages' in wiki_data:
                for page in wiki_data['related_pages']:
                    all_content.append(page.get('summary', ''))
        
        # Extract content from PubMed
        pubmed_data = next((item for item in data if item['source'] == 'pubmed'), None)
        if pubmed_data and 'articles' in pubmed_data:
            for article in pubmed_data['articles']:
                all_content.append(article.get('abstract', ''))
        
        # Extract content from Springer
        springer_data = next((item for item in data if item['source'] == 'springer'), None)
        if springer_data and 'articles' in springer_data:
            for article in springer_data['articles']:
                # Add abstract
                if 'abstract' in article and article['abstract']:
                    all_content.append(article['abstract'])
                # Add full text if available (open access articles)
                if 'full_text' in article and article['full_text']:
                    all_content.append(article['full_text'])
        
        # Clean all content
        cleaned_content = [self.clean_text(content) for content in all_content if content]
        
        if not cleaned_content:
            return ""
        
        # Use TF-IDF to find most relevant sentences
        # Split each content into sentences
        sentences = []
        for content in cleaned_content:
            sentences.extend(re.split(r'(?<=[.!?])\s+', content))
        
        # Remove short sentences
        sentences = [s for s in sentences if len(s.split()) > 5]
        
        if not sentences:
            return ""
        
        # Create TF-IDF vectorizer
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(sentences)
        
        # Create a query from keywords
        query = ' '.join(keywords)
        query_vector = vectorizer.transform([query])
        
        # Calculate similarity scores
        from sklearn.metrics.pairwise import cosine_similarity
        similarity_scores = cosine_similarity(query_vector, tfidf_matrix)[0]
        
        # Sort sentences by relevance
        sentence_scores = [(sentences[i], similarity_scores[i]) for i in range(len(sentences))]
        sentence_scores.sort(key=lambda x: x[1], reverse=True)
        
        MAX_SENTENCES = 20
        MIN_THRESHOLD = 0.1 

        filtered_sentences = [s for s in sentence_scores if s[1] >= MIN_THRESHOLD]

        top_sentences = filtered_sentences[:min(MAX_SENTENCES, len(filtered_sentences))]
        #top_sentences = sentence_scores[:int(len(sentence_scores) * 0.1)]
        
        # Sort back to original order
        original_order = {}
        for i, content in enumerate(cleaned_content):
            for sentence in re.split(r'(?<=[.!?])\s+', content):
                if sentence in [s[0] for s in top_sentences]:
                    original_order[sentence] = i
        
        final_content = []
        for sentence, _ in sorted(top_sentences, key=lambda x: original_order.get(x[0], 0)):
            final_content.append(sentence)
        
        processed_sentences = []
        for sentence in final_content:
            if not sentence.rstrip().endswith(('.', '!', '?')):
                sentence += '.'
            processed_sentences.append(sentence)
        return ' '.join(processed_sentences)


    def export_to_excel(self, data, filename=None):
        """Export the data to Excel file for easier analysis"""
        if not filename:
            timestamp = int(time.time())
            filename = f"science_data_{timestamp}.xlsx"
        
        file_path = os.path.join(self.data_dir, filename)
        
        # Prepare data frames for each source
        dfs = []
        
        # Wikipedia data
        wiki_data = next((item for item in data if item['source'] == 'wikipedia'), None)
        if wiki_data:
            if 'title' in wiki_data and 'content' in wiki_data:
                df_wiki = pd.DataFrame([{
                    'source': 'Wikipedia',
                    'title': wiki_data['title'],
                    'content': wiki_data['content'][:1000] + '...',  # Truncate long content
                    'url': wiki_data['url']
                }])
                dfs.append(df_wiki)
        
        # PubMed data
        pubmed_data = next((item for item in data if item['source'] == 'pubmed'), None)
        if pubmed_data and 'articles' in pubmed_data:
            pubmed_records = []
            for article in pubmed_data['articles']:
                pubmed_records.append({
                    'source': 'PubMed',
                    'title': article.get('title', ''),
                    'abstract': article.get('abstract', '')[:1000] + '...' if len(article.get('abstract', '')) > 1000 else article.get('abstract', ''),
                    'url': article.get('url', ''),
                    'journal': article.get('journal', ''),
                    'publication_date': article.get('publication_date', '')
                })
            if pubmed_records:
                df_pubmed = pd.DataFrame(pubmed_records)
                dfs.append(df_pubmed)
        
        # Springer data
        springer_data = next((item for item in data if item['source'] == 'springer'), None)
        if springer_data and 'articles' in springer_data:
            springer_records = []
            for article in springer_data['articles']:
                springer_records.append({
                    'source': 'Springer',
                    'title': article.get('title', ''),
                    'abstract': article.get('abstract', '')[:1000] + '...' if len(article.get('abstract', '')) > 1000 else article.get('abstract', ''),
                    'url': article.get('url', ''),
                    'journal': article.get('journal', ''),
                    'publication_date': article.get('publication_date', ''),
                    'has_full_text': 'Yes' if 'full_text' in article and article['full_text'] else 'No'
                })
            if springer_records:
                df_springer = pd.DataFrame(springer_records)
                dfs.append(df_springer)
        
        # Combine all dataframes
        if dfs:
            df_combined = pd.concat(dfs, ignore_index=True)
            df_combined.to_excel(file_path, index=False, engine='openpyxl')
            logger.info(f"Data exported to Excel: {file_path}")
            return file_path
        else:
            logger.warning("No data to export to Excel")
            return None

    def crawl(self, topic):
        """Main crawling function that coordinates the whole process"""
        try:
            start_time = time.time()
            logger.info(f"Starting crawl for topic: {topic}")
            
            # Extract keywords
            keywords = self.extract_keywords(topic)
            
            # Search different sources
            wiki_data = self.search_wikipedia(keywords)
            pubmed_data = self.search_pubmed(keywords)
            springer_data = self.search_springer(keywords)
            
            # Combine all data
            all_data = [wiki_data, pubmed_data, springer_data]
            
            # Extract most relevant content
            relevant_content = self.extract_relevant_content(all_data, keywords)
            
            # Prepare final data structure
            final_data = {
                'topic': topic,
                'keywords': keywords,
                'timestamp': datetime.now().isoformat(),
                'sources': all_data,
                'relevant_content': relevant_content
            }
            
            # Save data to file
            file_path = os.path.join(self.data_dir, f"{topic.replace(' ', '_').lower()}_{int(time.time())}.json")
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(final_data, f, ensure_ascii=False, indent=4)
            
            # Export to Excel for easier analysis
            excel_path = self.export_to_excel(all_data, f"{topic.replace(' ', '_').lower()}_{int(time.time())}.xlsx")
            
            logger.info(f"Crawl completed in {time.time() - start_time:.2f} seconds")
            logger.info(f"Data saved to {file_path}")
            
            return {
                'status': 'success',
                'file_path': file_path,
                'excel_path': excel_path,
                'data': final_data
            }
            
        except Exception as e:
            logger.error(f"Crawl error: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }

# API function to handle crawling requests
def crawl_topic(topic):
    """API function to handle crawling requests"""
    crawler = ScienceCrawler()
    return crawler.crawl(topic)

# Example usage
def main():
    result = crawl_topic("climate change")
    print(f"Crawl status: {result['status']}")
    if result['status'] == 'success':
        print(f"Data saved to: {result['file_path']}")
        if 'excel_path' in result and result['excel_path']:
            print(f"Excel data saved to: {result['excel_path']}")
        print(f"Relevant content: {result.get('relevant_content', '')}")
        print(f"Sources: {result.get('sources', [])}")
    else:
        print("Crawl failed")

if __name__ == "__main__":
    main()