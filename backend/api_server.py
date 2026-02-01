#!/usr/bin/env python3
"""
Flask API 服务器 - 为远程管理提供 HTTP 接口
提供数据更新触发功能，通过密码验证保护
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import logging
import os

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 管理员密码
ADMIN_PASSWORD = "888"

@app.route('/api/update', methods=['POST'])
def trigger_update():
    """
    触发服务器数据更新
    
    请求体:
        {
            "password": "管理员密码"
        }
    
    返回:
        {
            "status": "success" | "error",
            "message": "说明信息",
            "output": "脚本执行输出（可选）"
        }
    """
    try:
        # 验证密码
        data = request.json or {}
        password = data.get("password", "")
        
        if password != ADMIN_PASSWORD:
            logging.warning(f"密码验证失败: {request.remote_addr}")
            return jsonify({
                "status": "error",
                "message": "密码错误"
            }), 403
        
        logging.info(f"管理员触发更新: {request.remote_addr}")
        
        # 执行更新脚本
        script_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            'update_server.sh'
        )
        
        result = subprocess.run(
            ['/bin/bash', script_path],
            capture_output=True,
            text=True,
            timeout=300  # 5分钟超时
        )
        
        if result.returncode == 0:
            return jsonify({
                "status": "success",
                "message": "更新成功",
                "output": result.stdout
            })
        else:
            return jsonify({
                "status": "error",
                "message": "更新脚本执行失败",
                "output": result.stderr
            }), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({
            "status": "error",
            "message": "更新超时"
        }), 500
    except Exception as e:
        logging.error(f"更新失败: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    # 在生产环境中建议使用 gunicorn 等 WSGI 服务器
    app.run(host='0.0.0.0', port=5000, debug=False)
