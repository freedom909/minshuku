import os
from typing import Dict, Any, List, Optional
import requests
import json
import asyncio

class ReviewReplyOptimizer:
    """
    レビュー返信最適化サービス。宿泊施設のオーナーがレビューに対する返信を改善するのを支援します。
    """
    
    def __init__(self, api_url: Optional[str] = None, llm_service_url: Optional[str] = None):
        self.api_url = api_url or os.getenv("SUBGRAPH_REVIEWS_API_URL", "http://localhost:4001/graphql")
        self.llm_service_url = llm_service_url or os.getenv("LLM_SERVICE_URL", "http://localhost:5000/api/llm")
        
        # 初始化回应短语
        self.response_phrases = {
            "positive": [
                {"phrase": "ご評価いただき、誠にありがとうございます。", "usage": "冒頭"},
                {"phrase": "ご満足いただけて嬉しいです。", "usage": "称賛への返信"},
                {"phrase": "またのご利用を心よりお待ちしております。", "usage": "締めくくり"},
                {"phrase": "皆様のご支援こそが私たちの原動力です。", "usage": "感謝"},
                {"phrase": "今後も同じレベルを維持していきます。", "usage": "約束"}
            ],
            "negative": [
                {"phrase": "ご意見をいただき、心から感謝いたします。", "usage": "冒頭"},
                {"phrase": "大変申し訳ありません。", "usage": "謝罪"},
                {"phrase": "真摯に改善に取り組みます。", "usage": "約束"},
                {"phrase": "改善の機会をいただけることをお願いいたします。", "usage": "挽回"},
                {"phrase": "直ちにこの問題に対処します。", "usage": "行動"}
            ],
            "neutral": [
                {"phrase": "ご評価いただき、ありがとうございます。", "usage": "冒頭"},
                {"phrase": "今後も努力してまいります。", "usage": "約束"},
                {"phrase": "またのご利用をお待ちしております。", "usage": "締めくくり"},
                {"phrase": "ご提案は私たちにとって大変重要です。", "usage": "感謝"},
                {"phrase": "常にサービスを向上させていきます。", "usage": "改善"}
            ],
            "mixed": [
                {"phrase": "詳細なフィードバックをいただき、ありがとうございます。", "usage": "冒頭"},
                {"phrase": "ご肯定いただけて嬉しいです。", "usage": "肯定的な返信"},
                {"phrase": "指摘された問題について、大変申し訳ありません。", "usage": "謝罪"},
                {"phrase": "不十分な点を改善するよう努めます。", "usage": "約束"},
                {"phrase": "今後もより良いサービスを提供できるよう努力いたします。", "usage": "締めくくり"}
            ]
        }
    
    async def analyze_review(self, review_id: str) -> Dict[str, Any]:
        """レビュー内容と感情を分析します"""
        review_details = await self._get_review_details(review_id)
        
        if not review_details:
            return {
                "status": "error",
                "message": f"レビューID {review_id} の詳細情報を取得できませんでした。"
            }
        
        review_content = review_details.get("content", "")
        
        if not review_content:
            return {
                "status": "error",
                "message": "レビュー内容が空です。"
            }
        
        prompt = f"""
        カスタマーサービスの専門家として、以下のレビューの内容と感情を分析してください：
        
        レビュー内容：
        {review_content}
        
        評価：{review_details.get('rating')} 点
        
        以下を提供してください：
        1. レビューの主な意見
        2. 感情の傾向（ポジティブ/ネガティブ/ニュートラル）
        3. 指摘された具体的な問題または称賛
        4. 提案される返信のポイント
        5. 注意すべきデリケートなトピック
        
        宿泊施設のオーナーの立場から専門的な分析を提供してください。
        """
        
        try:
            analysis = await self._call_llm_service(prompt)
            
            return {
                "status": "success",
                "review_id": review_id,
                "review_content": review_content,
                "rating": review_details.get("rating"),
                "analysis": analysis,
                "sentiment": self._analyze_sentiment(review_content, review_details.get("rating", 0))
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"レビューの分析中にエラーが発生しました: {str(e)}"
            }
    
    async def generate_reply(self, review_id: str) -> Dict[str, Any]:
        """レビューの返信提案を生成します"""
        review_details = await self._get_review_details(review_id)
        
        if not review_details:
            return {
                "status": "error",
                "message": f"レビューID {review_id} の詳細情報を取得できませんでした。"
            }
        
        analysis_result = await self.analyze_review(review_id)
        
        if analysis_result["status"] == "error":
            return analysis_result
        
        reply_strategy = await self._get_reply_strategy(analysis_result["sentiment"])
        
        prompt = f"""
        カスタマーサービスの専門家として、以下のレビューに対して、プロフェッショナルでフレンドリーな返信を生成してください：
        
        レビュー内容：
        {review_details.get('content')}
        
        評価：{review_details.get('rating')} 点
        
        レビュー分析：
        {analysis_result.get('analysis')}
        
        返信戦略：
        {reply_strategy}
        
        以下の条件を満たす返信を生成してください：
        1. お客様の評価に感謝する
        2. 具体的なフィードバックに対応する
        3. 問題がある場合、謝罪する
        4. 改善策を説明する（該当する場合）
        5. 再度お客様をお迎えできることを期待する旨を伝える
        6. プロフェッショナルでフレンドリーな口調を保つ
        
        完全な返信を提供してください。
        """
        
        try:
            reply = await self._call_llm_service(prompt)
            
            return {
                "status": "success",
                "review_id": review_id,
                "review_content": review_details.get("content"),
                "rating": review_details.get("rating"),
                "suggested_reply": reply,
                "reply_strategy": reply_strategy
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"返信の生成中にエラーが発生しました: {str(e)}"
            }
    
    async def get_reply_templates(self, sentiment: str = "positive") -> Dict[str, Any]:
        """レビューの返信テンプレートを取得します"""
        prompt = f"""
        カスタマーサービスの専門家として、{sentiment}なレビューに対して、3種類の異なるスタイルの返信テンプレートを提供してください：
        
        以下のスタイルのテンプレートを提供してください：
        1. 正式なプロフェッショナルスタイル
        2. 温かく友好的なスタイル
        3. シンプルで直接的なスタイル
        
        各テンプレートには以下が含まれるべきです：
        - 冒頭の感謝
        - 対応する返信部分
        - [ネガティブな評価の場合] 謝罪と改善の約束部分
        - 再度のご利用を期待する部分
        - 締めの言葉
        
        「具体的なフィードバック」、「改善策」、「具体的な称賛」などのプレースホルダーを使用して、宿泊施設のオーナーが具体的な内容を入力できるようにしてください。
        """
        
        try:
            templates = await self._call_llm_service(prompt)
            
            usage_instructions = """
            使用方法：
            1. レビューの種類に最も適したテンプレートを選択します。
            2. 「プレースホルダー」を具体的なレビュー内容に置き換えます。
            3. 必要に応じて口調と内容を調整します。
            4. 返信が真摯でプロフェッショナルなものになるようにします。
            5. 文法とスペルをチェックします。
            """
            
            return {
                "status": "success",
                "sentiment": sentiment,
                "templates": templates,
                "usage_instructions": usage_instructions
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"返信テンプレートの取得中にエラーが発生しました: {str(e)}"
            }
    
    async def get_reply_tips(self, review_id: str) -> Dict[str, Any]:
        """レビューの返信アドバイスを取得します"""
        analysis_result = await self.analyze_review(review_id)
        
        if analysis_result["status"] == "error":
            return analysis_result
        
        prompt = f"""
        カスタマーサービスの専門家として、このレビューにどのように返信するかの具体的なアドバイスを提供してください：
        
        レビュー内容：
        {analysis_result.get('review_content')}
        
        レビュー分析：
        {analysis_result.get('analysis')}
        
        以下を提供してください：
        1. 返信の重要なポイント
        2. 避けるべき表現
        3. 提案される口調と態度
        4. 具体的なフィードバックにどう対処するか
        5. 返信をどのように締めくくるか
        
        具体的で実行可能なアドバイスを提供してください。
        """
        
        try:
            tips = await self._call_llm_service(prompt)
            
            return {
                "status": "success",
                "review_id": review_id,
                "review_content": analysis_result.get("review_content"),
                "reply_tips": tips,
                "positive_phrases": self.response_phrases[analysis_result["sentiment"]],
                "sentiment": analysis_result["sentiment"]
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"返信アドバイスの取得中にエラーが発生しました: {str(e)}"
            }
    
    def _analyze_sentiment(self, content: str, rating: int) -> str:
        """レビューの感情傾向を分析します"""
        if rating >= 4:
            base_sentiment = "positive"
        elif rating <= 2:
            base_sentiment = "negative"
        else:
            base_sentiment = "neutral"
        
        negative_keywords = ["悪い", "ひどい", "不十分", "失望する", "汚い", "うるさい", "高い", "問題", "不満"]
        positive_keywords = ["良い", "素敵", "素晴らしい", "きれい", "満足する", "好き", "おすすめ", "完璧", "快適", "優秀"]
        
        negative_count = sum(1 for word in negative_keywords if word in content)
        positive_count = sum(1 for word in positive_keywords if word in content)
        
        if negative_count > positive_count and base_sentiment != "negative":
            return "mixed"
        elif positive_count > negative_count and base_sentiment != "positive":
            return "mixed"
        
        return base_sentiment
    
    async def _get_review_details(self, review_id: str) -> Dict[str, Any]:
        """レビューの詳細情報を取得します"""
        query = """
        query GetReview($id: ID!) {
          review(id: $id) {
            id
            content
            rating
            createdAt
            listing {
              id
              title
            }
            author {
              id
              name
            }
          }
        }
        """
        
        variables = {"id": review_id}
        
        try:
            response = requests.post(
                self.api_url,
                json={"query": query, "variables": variables},
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            result = response.json()
            
            if "errors" in result:
                raise Exception(f"GraphQL Error: {json.dumps(result['errors'])}")
            
            return result["data"]["review"]
            
        except Exception as e:
            raise Exception(f"レビューの詳細情報の取得中にエラーが発生しました: {str(e)}")
    
    async def _get_reply_strategy(self, sentiment: str) -> str:
        """レビューの返信戦略を取得します"""
        strategies = {
            "positive": """
            1. 具体的な称賛に対して心から感謝する
            2. 関連するさらなるポジティブな情報を共有する
            3. 再度のご利用をお誘いする
            4. 熱心で友好的な口調を保つ
            """,
            "negative": """
            1. 心から謝罪する
            2. 問題を認め、該当する場合は説明する
            3. 具体的な改善策を説明する
            4. 補償または解決策を提供する
            5. プロフェッショナルで建設的な態度を保つ
            """,
            "neutral": """
            1. 評価に感謝する
            2. ポジティブな点を強調する
            3. 指摘された問題に対処する
            4. 継続的な改善の約束を表明する
            """,
            "mixed": """
            1. ポジティブなフィードバックに感謝する
            2. ネガティブなフィードバックを真摯に受け止める
            3. 説明と改善策
            4. ポジティブとネガティブな返信のバランスをとる
            """
        }
        
        return strategies.get(sentiment, strategies["neutral"])
    
    async def _call_llm_service(self, prompt: str) -> str:
        """
        LLMサービスを呼び出して応答を取得します

        Args:
            prompt: プロンプトテキスト
        
        Returns:
            LLMサービスの応答テキスト
        
        Raises:
            Exception: LLMサービスの呼び出しに失敗した場合
        """
        try:
            response = requests.post(
                self.llm_service_url,
                json={"prompt": prompt},
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            result = response.json()
            
            if "error" in result:
                raise Exception(f"LLM Service Error: {result['error']}")
            
            return result.get("response", "")
            
        except Exception as e:
            raise Exception(f"LLMサービスの呼び出し中にエラーが発生しました: {str(e)}")