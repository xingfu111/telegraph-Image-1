export const runtime = 'edge';
import { getRequestContext } from '@cloudflare/next-on-pages';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Content-Type': 'application/json'
};

/**
 * 
 * 接口来自：https://github.com/BlueSkyXN/WorkerJS_CloudFlare_ImageBed/blob/main/cloudflare-worker-js-api/API_IMG_vviptuangou.js
 * 
 */

export async function POST(request) {
  const { env, cf, ctx } = getRequestContext(); // 获取上下文
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.socket.remoteAddress; // 获取客户端IP
  const clientIp = ip ? ip.split(',')[0].trim() : 'IP not found'; // 提取第一个IP地址
  const Referer = request.headers.get('Referer') || "Referer"; // 获取Referer信息

  const formData = await request.formData(); // 提取上传的表单数据
  const file = formData.get('file'); // 获取文件字段
  if (!file) {
    return new Response('No file uploaded', { status: 400 }); // 未上传文件时返回错误
  }

  // 验证文件类型
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif',      // 图片类型
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo' // 视频类型
  ];
  if (!allowedMimeTypes.includes(file.type)) {
    return new Response(
      JSON.stringify({ error: 'Invalid file type. Only images and videos are allowed.' }), 
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    // 构建 fetch 请求，将文件上传到目标服务器
    const newFormData = new FormData();
    newFormData.append('file', file, file.name);

    const headers = {
      'Accept': '*/*',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'client-id': 'p5gfsvmw6qnwc45n000000000025bbf1',
      'token': 'AgExJGIDKT6d8x9Ts0ZDPuwgZh1lL00IuiolbhzXCqFdCFCz_BOngFnhtTI8DX34jx3ngELAOUwHNAAAAAAJJQAA5-mgt_SswJGube8h7BwPVK5EJvksfk2bMoY28rtnUVnZDp2k-pvvqMXEiN6JyVVA'
    };

    const uploadResponse = await fetch('https://pic-up.meituan.com/extrastorage/new/video?isHttps=true', {
      method: 'POST',
      body: newFormData,
      headers
    });

    if (!uploadResponse.ok) {
      const errorResponse = await uploadResponse.text();
      return new Response(
        JSON.stringify({ error: 'Upload failed', details: errorResponse }),
        { status: 500, headers: corsHeaders }
      );
    }

    const jsonResponse = await uploadResponse.json();
    if (jsonResponse.success === true) {
      const originalLink = jsonResponse.data.originalLink;
      const originalFileName = jsonResponse.data.originalFileName;

      // 返回上传成功的响应
      const data = {
        "Jobs": originalLink,
        "Name": originalFileName,
        "code": 200
      };

      return new Response(JSON.stringify(data, null, 2), {
        status: 200,
        headers: corsHeaders
      });
    } else {
      return new Response(
        JSON.stringify({ error: 'Upload failed', details: jsonResponse }),
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

  



async function insertImageData(env, src, referer, ip, rating, time) {
  try {
    const instdata = await env.prepare(
      `INSERT INTO imginfo (url, referer, ip, rating, total, time)
           VALUES ('${src}', '${referer}', '${ip}', ${rating}, 1, '${time}')`
    ).run()
  } catch (error) {

  };
}



async function get_nowTime() {
  const options = {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  const timedata = new Date();
  const formattedDate = new Intl.DateTimeFormat('zh-CN', options).format(timedata);

  return formattedDate

}
