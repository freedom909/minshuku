import { Client } from '@elastic/elasticsearch';

export const searchReviews=async (criteria)=>{
    const client=new Client({node:'http://localhost:9200'})

    const query={
        bool:{
            must:[
                 {match:{authorName:criteria.authorName}},
                 {match:{authorNickname:criteria.authorNickname}},
                 {match:{content:criteria.content}},
                 {match:{rating:criteria.rating}},
                 {match:{locationId:criteria.locationId}},
                 {match:{guestId:criteria.guestId}},
                 {match:{hostId:criteria.hostId}},
                 {match:{createdAt:criteria.createdAt}},
            ]
        }
    }
    const response=await client.indices.create({
        index: 'reviews',
        body: {
          mappings: {
            properties: {
              authorName: { type: 'text' },
              authorNickname: { type: 'text' }, // Store both but expose only nickname
              content: { type: 'text' },
              rating: { type: 'integer' },
              locationId: { type: 'keyword' },
              guestId: { type: 'keyword' },
              hostId: { type: 'keyword' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
            },
          },
        },
      });
    return response.hits.hits.map(hit => hit._source);
}