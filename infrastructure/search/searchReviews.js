import { Client } from '@elastic/elasticsearch';

export const searchReviews=async (criteria)=>{
    const client=new Client({node:'http://localhost:9200'})

    const query={
        bool:{
            must:[
                 // Add your filtering criteria here, e.g., by hostName, date, rating, etc.
            ]
        }
    }
    const response=await client.search({
        index:'reviews',
        body:{
            _source: ['hostName', 'guestNickname', 'reviewText', 'rating', 'date'], // Exclude guestName
            query: query,
        }
    })
    return response.hits.hits.map(hit => hit._source);
}