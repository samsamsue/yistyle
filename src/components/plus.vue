<script>

export default{
    //生成随机ID
    getRandID(len=8){
        return Number(Math.random().toString().substring(3,len) + Date.now()).toString(36)
    },
    //动态引入js
    loadScript(url,opts={}){
        window._script_list = window._script_list || [];

        let urlList = typeof url == 'object' ? url : [url];
        let total = urlList.length;
        if( total < 1 ) return;
        let count = 0;
        let failed = false;

        const promise =  new Promise((res,rej)=>{

            let check = function(){
                count++;
                if(total == count){
                    failed ? rej() : res();
                }
            }

            let add = function(scriptUrl,callback){
                //已加载过的忽略本次请求
                if(_script_list.indexOf(scriptUrl) > -1){
                    check();
                    typeof callback == 'function' && callback();
                    return;
                }

                let script = document.createElement('script');
                script.src = scriptUrl;
                //记录些地址为已加载
                _script_list.push(scriptUrl);
                document.head.appendChild(script);

                script.onload = ()=>{
                    check();
                    typeof callback == 'function' && callback();
                    if(opts.delete) script.remove();
                };
                script.onerror = ()=>{
                    failed = true;
                    check();
                    typeof callback == 'function' && callback();
                    if(opts.delete) script.remove();
                };
            }

            let syncLoop = function(){
                add(urlList[count],()=>{
                    if(count < total) syncLoop();
                })
            }

            //同步
            if(opts.sync){
                syncLoop(count, total - 1);
            }
            //异步
            else{
                for(let currentUrl of urlList){
                    add(currentUrl);
                }
            }
        });

        return promise;
    },
    jsonp(url){
        return new Promise((res,rej)=>{
            var callbackName = '_jsonp_' + this.getRandID();
            window[callbackName] = (data)=>{
                res(data);
            }
            url = url + (url.indexOf('?') > -1 ? '&' : '?') + 'callback=' + callbackName;
            this.loadScript(url,{delete:true}).catch(rej);
        });       
    },


}

</script>