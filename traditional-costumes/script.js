// 定义每个服饰的提示词
const costumePrompts = {
    china: "A beautiful traditional Chinese Hanfu dress, elegant flowing robes with wide sleeves, intricate embroidery patterns, worn by a young woman, professional photography, detailed fabric texture, traditional Chinese aesthetic",
    japan: "Traditional Japanese Kimono with elaborate obi belt, delicate floral patterns, silk fabric, worn by a woman, professional studio lighting, soft colors, authentic Japanese style",
    korea: "Korean Hanbok dress with high waist and full skirt, vibrant colors, traditional patterns, worn by a young woman, professional photography, authentic Korean fashion",
    india: "Elegant Indian Sari with rich embroidery and detailed patterns, draped gracefully, vibrant colors, worn by a woman, professional photography, traditional Indian dress",
    scotland: "Traditional Scottish Highland dress with authentic tartan kilt pattern, complete with sporran and accessories, worn in a Scottish landscape, professional photography",
    russia: "Traditional Russian Sarafan dress with decorative embroidery, bright colors, worn with kokoshnik headdress, professional photography, authentic Russian folk costume"
};

// 为每个服饰生成图片
async function generateImages() {
    for (const [id, prompt] of Object.entries(costumePrompts)) {
        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // 创建图片元素
            const img = document.createElement('img');
            img.src = data.url;
            img.alt = `${id} traditional costume`;
            
            // 替换加载提示
            const container = document.querySelector(`#${id} .image-container`);
            container.innerHTML = '';
            container.appendChild(img);

        } catch (error) {
            console.error(`Error generating image for ${id}:`, error);
            // 显示错误信息
            const container = document.querySelector(`#${id} .image-container`);
            container.innerHTML = '<div class="loading">图片生成失败</div>';
        }
    }
}

// 页面加载完成后开始生成图片
document.addEventListener('DOMContentLoaded', generateImages);