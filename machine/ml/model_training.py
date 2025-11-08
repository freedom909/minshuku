# machine/ml/model_training.py
"""Model Training and Management Module"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import os

logger = logging.getLogger(__name__)

class ModelTrainingManager:
    """Manage ML model training, evaluation, and deployment"""
    
    def __init__(self, mysql_pool, neo4j_driver):
        self.mysql_pool = mysql_pool
        self.neo4j_driver = neo4j_driver
        self.model_dir = "ml_models"
        self.training_history = []
        os.makedirs(self.model_dir, exist_ok=True)
    
    async def train_pricing_model(self, training_data: Dict) -> Dict:
        """Train pricing prediction model"""
        try:
            logger.info("Starting pricing model training")
            
            # Prepare training data
            X, y = await self._prepare_pricing_data(training_data)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train model
            model = await self._train_model("pricing", X_train, y_train)
            
            # Evaluate model
            evaluation = await self._evaluate_model(model, X_test, y_test)
            
            # Save model
            model_path = os.path.join(self.model_dir, "pricing_model.joblib")
            joblib.dump(model, model_path)
            
            # Record training
            training_record = {
                "model_type": "pricing",
                "training_date": datetime.now().isoformat(),
                "evaluation_metrics": evaluation,
                "model_path": model_path,
                "data_size": len(X)
            }
            self.training_history.append(training_record)
            
            return {
                "success": True,
                "model": "pricing",
                "evaluation": evaluation,
                "model_path": model_path,
                "training_summary": training_record
            }
            
        except Exception as e:
            logger.error(f"Error training pricing model: {e}")
            return {"error": str(e)}
    
    async def train_recommendation_model(self, training_data: Dict) -> Dict:
        """Train recommendation model"""
        try:
            logger.info("Starting recommendation model training")
            
            # Prepare training data
            X, y = await self._prepare_recommendation_data(training_data)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train model
            model = await self._train_model("recommendation", X_train, y_train)
            
            # Evaluate model
            evaluation = await self._evaluate_model(model, X_test, y_test)
            
            # Save model
            model_path = os.path.join(self.model_dir, "recommendation_model.joblib")
            joblib.dump(model, model_path)
            
            # Record training
            training_record = {
                "model_type": "recommendation",
                "training_date": datetime.now().isoformat(),
                "evaluation_metrics": evaluation,
                "model_path": model_path,
                "data_size": len(X)
            }
            self.training_history.append(training_record)
            
            return {
                "success": True,
                "model": "recommendation",
                "evaluation": evaluation,
                "model_path": model_path,
                "training_summary": training_record
            }
            
        except Exception as e:
            logger.error(f"Error training recommendation model: {e}")
            return {"error": str(e)}
    
    async def evaluate_all_models(self) -> Dict:
        """Evaluate all trained models"""
        try:
            logger.info("Evaluating all models")
            
            evaluation_results = {}
            
            # Evaluate pricing model
            pricing_eval = await self._evaluate_existing_model("pricing")
            evaluation_results["pricing"] = pricing_eval
            
            # Evaluate recommendation model
            recommendation_eval = await self._evaluate_existing_model("recommendation")
            evaluation_results["recommendation"] = recommendation_eval
            
            # Calculate overall health score
            health_score = await self._calculate_model_health_score(evaluation_results)
            
            return {
                "success": True,
                "evaluation_results": evaluation_results,
                "overall_health_score": health_score,
                "recommendations": await self._generate_model_recommendations(evaluation_results)
            }
            
        except Exception as e:
            logger.error(f"Error evaluating models: {e}")
            return {"error": str(e)}
    
    async def retrain_models(self, model_types: List[str]) -> Dict:
        """Retrain specified models with latest data"""
        try:
            logger.info(f"Retraining models: {model_types}")
            
            retraining_results = {}
            
            for model_type in model_types:
                # Get latest data
                latest_data = await self._get_latest_training_data(model_type)
                
                if model_type == "pricing":
                    result = await self.train_pricing_model(latest_data)
                elif model_type == "recommendation":
                    result = await self.train_recommendation_model(latest_data)
                else:
                    result = {"error": f"Unknown model type: {model_type}"}
                
                retraining_results[model_type] = result
            
            return {
                "success": True,
                "retraining_results": retraining_results,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error retraining models: {e}")
            return {"error": str(e)}
    
    async def get_training_history(self) -> Dict:
        """Get model training history"""
        try:
            return {
                "success": True,
                "training_history": self.training_history,
                "total_models_trained": len(self.training_history),
                "latest_training": self.training_history[-1] if self.training_history else None
            }
            
        except Exception as e:
            logger.error(f"Error getting training history: {e}")
            return {"error": str(e)}
    
    # Helper methods
    async def _prepare_pricing_data(self, training_data: Dict):
        """Prepare pricing training data"""
        # Simulate data preparation
        X = np.random.rand(100, 5)  # Features: season, location, amenities, etc.
        y = np.random.rand(100) * 200 + 50  # Target: price
        return X, y
    
    async def _prepare_recommendation_data(self, training_data: Dict):
        """Prepare recommendation training data"""
        # Simulate data preparation
        X = np.random.rand(100, 10)  # Features: user preferences, listing features
        y = np.random.randint(0, 2, 100)  # Target: click/booking
        return X, y
    
    async def _train_model(self, model_type: str, X_train, y_train):
        """Train a model"""
        from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
        
        if model_type == "pricing":
            model = RandomForestRegressor(n_estimators=100, random_state=42)
        else:  # recommendation
            model = RandomForestClassifier(n_estimators=100, random_state=42)
        
        model.fit(X_train, y_train)
        return model
    
    async def _evaluate_model(self, model, X_test, y_test):
        """Evaluate model performance"""
        predictions = model.predict(X_test)
        
        if hasattr(model, 'predict_proba'):  # Classification model
            accuracy = accuracy_score(y_test, predictions)
            precision = precision_score(y_test, predictions, average='weighted')
            recall = recall_score(y_test, predictions, average='weighted')
            f1 = f1_score(y_test, predictions, average='weighted')
            
            return {
                "accuracy": accuracy,
                "precision": precision,
                "recall": recall,
                "f1_score": f1
            }
        else:  # Regression model
            from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
            
            mae = mean_absolute_error(y_test, predictions)
            mse = mean_squared_error(y_test, predictions)
            r2 = r2_score(y_test, predictions)
            
            return {
                "mae": mae,
                "mse": mse,
                "r2_score": r2
            }
    
    async def _evaluate_existing_model(self, model_type: str):
        """Evaluate an existing model"""
        model_path = os.path.join(self.model_dir, f"{model_type}_model.joblib")
        
        if not os.path.exists(model_path):
            return {"error": f"Model not found: {model_path}"}
        
        # Load model and evaluate with test data
        model = joblib.load(model_path)
        
        # Generate test data for evaluation
        if model_type == "pricing":
            X_test = np.random.rand(20, 5)
            y_test = np.random.rand(20) * 200 + 50
        else:
            X_test = np.random.rand(20, 10)
            y_test = np.random.randint(0, 2, 20)
        
        return await self._evaluate_model(model, X_test, y_test)
    
    async def _calculate_model_health_score(self, evaluation_results: Dict) -> float:
        """Calculate overall model health score"""
        scores = []
        
        for model_type, results in evaluation_results.items():
            if "error" not in results:
                if "accuracy" in results:  # Classification
                    scores.append(results["accuracy"])
                elif "r2_score" in results:  # Regression
                    scores.append(max(0, results["r2_score"]))  # R2 can be negative
        
        return np.mean(scores) if scores else 0.0
    
    async def _generate_model_recommendations(self, evaluation_results: Dict) -> List[str]:
        """Generate model improvement recommendations"""
        recommendations = []
        
        for model_type, results in evaluation_results.items():
            if "error" in results:
                recommendations.append(f"Train {model_type} model - model not found")
            else:
                if "accuracy" in results and results["accuracy"] < 0.8:
                    recommendations.append(f"Improve {model_type} model - accuracy low")
                elif "r2_score" in results and results["r2_score"] < 0.7:
                    recommendations.append(f"Improve {model_type} model - R2 score low")
        
        return recommendations

# Global instance
model_training_manager = ModelTrainingManager(None, None)