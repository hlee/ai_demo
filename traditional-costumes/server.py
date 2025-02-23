from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import os

app = Flask(__name__)
CORS(app)  # 启用CORS以允许前端访问

@app.route('/')
def serve_static():
    return app.send_static_file('index.html')

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    try:
        data = request.json
        prompt = data.get('prompt')
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400

        # 构建MCP工具调用的JSON
        mcp_request = {
            "server_name": "flux-schnell",
            "tool_name": "generate_image",
            "arguments": {
                "prompt": prompt
            }
        }

        # 将请求写入临时文件
        with open('temp_request.json', 'w') as f:
            json.dump(mcp_request, f)

        # 调用MCP工具
        result = subprocess.run(
            ['cline', 'mcp', 'temp_request.json'],
            capture_output=True,
            text=True
        )

        # 删除临时文件
        os.remove('temp_request.json')

        if result.returncode != 0:
            return jsonify({'error': 'Image generation failed'}), 500

        # 解析MCP工具的响应
        response_data = json.loads(result.stdout)
        
        # 从响应中提取图片URL
        image_url = response_data.get('url', '')
        
        if not image_url:
            return jsonify({'error': 'No image URL in response'}), 500

        return jsonify({'url': image_url})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # 设置静态文件目录为当前目录
    app.static_folder = '.'
    # 允许外部访问
    app.run(host='0.0.0.0', port=8080)