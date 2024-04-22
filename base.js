/* 数组转transform的matrix */
const toMatrix = function(args) {
    let matrixStr = args.length > 13 ? 'matrix3d' : 'matrix';
    return matrixStr + '(' + args.join(',') + ')';
};

/* 创建dom */
const $dom = function(tag,attrs,children){
    const dom = document.createElement(tag); 
    
    for(let attr in attrs){
        dom.setAttribute(attr,attrs[attr]);
    }
    if(typeof children === 'object'){
        if(Array.isArray(children)){
            children.forEach(child=>{
                if(typeof child == 'object'){
                    dom.appendChild(child)
                }else{
                    dom.innerHTML += child;
                }
            })
        }else{
            dom.appendChild(children);
        }
        
    }else if(children){
        dom.innerHTML = children;
    }
    return dom;
}

/* 图片懒加载 */
const lazysrc = function(el,attrs){
    const list = $(el).$$('[lazy-src]');
    const main = function(e){
        const fit = $(e.target).attr('fit') || 'cover';
        const mode = $(e.target).attr('bgmode') != undefined ? 'bg' : ($(e.target).attr('mode') || 'img');
        const src = $(e.target).attr('lazy-src');
        const props = $(e.target).attr('props');

        if(e.detail.visible ){
            if(mode == 'img'){
                let picture = null

                if($(e.target).$$('source').list.length  > 0){
                    picture = $dom('picture');
                    $(e.target).append(picture);
                }
                const dom = $dom('img',{
                    style:`width:100%;height:100%;object-fit:${fit};display:block;`,
                    src:src,
                });
                if(props){
                    props.split(',').forEach(prop=>{
                        dom.setAttribute(prop, $(e.target).attr(prop));
                    })
                }

                if(picture){
                    $(e.target).$$('source').each(item=>{
                        picture.append(item)
                    })
                    picture.append(dom);
                    $(e.target).append(picture);
                }else{
                    $(e.target).append(dom);
                }
                
                $(dom).attr(attrs);
            }
            
            if(mode == 'bg'){
                e.target.style.backgroundImage = `url(${src})`;
            }

            e.target.removeAttribute('lazy-src');

            $(e.target).un('visiblechange',main);
        }
    }
    list.on && list.on('visiblechange',main);
}

function $(seletor){
    const el = typeof seletor == 'object' ? seletor : document.querySelector(seletor) ;
    const fn = function(){}

    /* 自定义事件 */
    const customEvents = {
        /* dom可视状态变化时 */
        visiblechange(){
            const observer = new IntersectionObserver((entries)=>{
                let visible = entries[0].isIntersecting;
                const event = new CustomEvent("visiblechange", { detail: {visible:visible} });
                el.dispatchEvent(event)
            });
            observer.observe(el);
            return {
                off(){
                    observer.disconnect();
                }
            };
        },
        /* dom长按事件 */
        longpress(){
            let timer;
            const mousedown = function(){
                timer = setTimeout(()=>{
                    const event = new CustomEvent("longpress");
                    el.dispatchEvent(event);
                },500);
                const mouseup = ()=>{
                    clearTimeout(timer);
                    fn.un('mouseup', mouseup);
                }
                fn.on('mouseup',mouseup)
            }
            fn.on('mousedown',mousedown);
            return {
                off(){
                    el.removeEventListener('mousedown',mousedown);
                }
            }
        }
    };

    const proto = {
        el:el,
        addClass(className){
            el.classList.add(className)
        },
        on(eventName,selector,callback){
            callback = typeof selector === 'function' ? selector : callback;

            if(typeof selector === 'string'){
                fn.on(eventName,function(e){
                    $$(selector).forEach(function(item){
                        if(item.el.isSameNode(e.target)){
                            callback.call(item.el,e);
                            return;
                        }
                    })
                })
                return fn;
            }

            let eventNames = eventName.split(' ');
            if(eventNames.length > 1){
                eventNames.forEach(evName=>{
                    fn.on(evName,selector,callback);
                })
                return;
            }

            let others = {};
            if(customEvents[eventName]){
                others = customEvents[eventName]();
            } 

            el.addEventListener(eventName,callback);
            let events = el._events || {};
            events[eventName]  = events[eventName] || [];

            events[eventName].push({
                on:callback,
                ...others
            });
            el._events = events;
            return fn;
        },
        un(eventName,ev){
            if(!eventName.trim()){return;}
            let eventNames = eventName.split(' ');
            if(!eventNames.length && typeof ev == 'function'){
                el.removeEventListener(eventName,ev);
                return el;
            }

            if(eventNames.length > 1){
                eventNames.forEach(evName=>{
                    fn.un(evName,ev);
                })
                return;
            }

            let events = el._events;
            for(let name in events){
                if(name != eventName){
                    continue;
                }
                let calls = events[name];
                calls.forEach((eventOpt,index)=>{
                    el.removeEventListener(name, eventOpt.on);
                    if(eventOpt.off){
                        eventOpt.off();
                    }
                    calls.splice(index,1);
                })
                if(calls.length < 1){
                    Reflect.deleteProperty(events, name)
                }
            }
            el._events = events;
            return fn;
        },
        html(html){
            if(html !== undefined){
                el.innerHTML = html;
                return fn;
            }
            return el.innerHTML;
        },
        style(style){
            if(typeof style == 'string'){
                return  getComputedStyle(el)[style];
            }
            for(let name in style){
                el.style[name] = style[name];
            }
            return fn;
        },
        attr(attrs){
            if(typeof attrs == 'string'){
                return el.getAttribute(attrs);
            }
            for(let name in attrs){
                el.setAttribute(name, attrs[name]);
            }
            return fn;
        },
        show(){
            let display = el._style_display;
            if (display) {
                el.style.display = display;
            } else {
                el.style.display = null;
            }
            return fn;
        },
        hide: function() {
            if (!el._style_display) {
                el._style_display = el.style.display;
            }
            el.style.display = 'none';
            return fn;
        },
        addClass(className){
            className.split(' ').forEach(function (classItem) {
                classItem && el.classList.add(classItem);

            });
            return fn;
        },
        removeClass(className){
            className.split(' ').forEach(function (classItem) {
                classItem && el.classList.remove(classItem);
            });
            return fn;
        },
        toggleClass(className){
            className.split(' ').forEach(function (classItem) {
                classItem && el.classList.toggle(classItem);
            });
            return fn;
        },
        append(selector){
            el.appendChild(selector);
            return fn;
        },
        before(selector){
            el.parentNode.insertBefore($(selector).el, el);
            return fn;
        },
        after(selector){
            el.parentNode.insertBefore($(selector).el, el.nextSibling);
            return fn;
        },
        remove(selector){
            if(selector){
                el.removeChild($(selector).el);
            }else{
                el.parentNode.removeChild(el);
            }
            return fn;
        },
        translate(x, y){
            let transform = this.style('transform');
            if (!transform || transform == 'none') {
                transform = 'matrix(1, 0, 0, 1, 0, 0)';
            }
            let group = transform.match(/\(([^)]+)\)/)[1];
            let args = group.split(',');
            let isReturn = x === undefined && y === undefined;

            if(isReturn){
                if (args.length > 13) {
                    return {
                        x: parseFloat(args[13]),
                        y: parseFloat(args[14])
                    };
                } else {
                    return {
                        x: parseFloat(args[4]),
                        y: parseFloat(args[5])
                    }
                }
            }else{
                if (args.length > 13) {
                    args[13] = x;
                    args[14] = y;
                } else {
                    args[4] = x;
                    args[5] = y;
                }
            }
            el.style.transform = toMatrix(args);
            return fn;
        },
        /*
        $('.xxx').animate(
            {marginLeft:'20px'},//或者[]，如果数组则播放序列动画
            1000,
            function(oriStyle:动画前的style，用于复原){})
        */
        animate(css,duration, callback){
            const oriStyle = el._style || this.attr('style');
            el._style = oriStyle;
            let index = 0;

            let getDuration = function(style){
                const tmpDom = document.createElement('div');
                $(tmpDom).style(style);
                const transitionDuration = tmpDom.style.transitionDuration;
                tmpDom.remove();
                if(!transitionDuration) return duration;
                if(/\d+ms/i.test(transitionDuration)){
                    return parseFloat(transitionDuration.replace('ms'));
                }
                return parseFloat(transitionDuration.replace('s'));
            }
            let sequence = ()=>{
                const newDuration = getDuration(css[index]) || duration;
                $(el).style(css[index]);
                if(index < css.length ){
                    el._timer = setTimeout(sequence,newDuration);
                }else{
                    if(typeof callback == 'function'){
                        callback.call(el, oriStyle);
                    }
                }
                index++;
            }
            el._transition = el._transition || el.style.transition;
            el.style.transitionDuration = duration + 'ms';
            if(Array.isArray(css)){
                sequence();
            }else{
                this.style(css);
                const newDuration = getDuration(css) || duration;
                el._timer = setTimeout(()=>{
                    typeof callback === 'function' && callback.call(el, oriStyle);
                },newDuration);
            }

            return fn;
        },
        stop(){
            clearTimeout(el._timer);
            el.style.transition = 'none';
            setTimeout(()=>{
                el.style.transition = el._transition;
            });
        },
        trigger(eventName){
           const ev = new Event(eventName);
           el.dispatchEvent(ev);
           return fn;
        },
        /* 
        参数{
            inertia:false,//惯性滑动
            force:{x:true,y:true} //临界阻力
        }
        */
        drag(opts={}){
            let beginX,beginY;
            let oldX,oldY,moveX, moveY;
            let velocityX,velocityY;
            let endX,endY;

            opts.force = opts.force || {};
            opts.force = opts.force === true ? {x:true,y:true} : opts.force;
            opts.max = opts.max || {};
            opts.min = opts.min || {};
            
            const begin = (e)=>{
                let ev = e.touches ? e.touches[0] : e;
                if (ev.button != 0 && ev.button != undefined) {
                    return;
                }
                e.stopPropagation();
                beginX = ev.pageX;
                beginY = ev.pageY;
                endX = ev.pageX;
                endY = ev.pageY;
                let old = fn.translate();
                oldX = old.x;
                oldY = old.y;
                fn.style({transition:null});

                if(typeof opts.begin == 'function') opts.begin.call(el, {x:oldX, y:oldY, e:ev} )
                $(document).on('mouseup touchend',end);
                $(document).on('mousemove touchmove',move);
            }

            /* 重置为当前 */
            const reset = ()=>{
                let newTranslate = fn.translate();
                oldX = newTranslate.x;
                oldY = newTranslate.y;
                beginX = endX;
                beginY = endY;
            }

            const v = (val)=>{
                if(typeof val === 'function'){
                    return val()
                }
                return val;
            }

            const range = (distanceX,distanceY)=>{
                if(distanceX !==undefined && distanceY !== undefined){
                    moveX = (oldX||0) +  distanceX;
                    moveY = (oldY||0) +  distanceY;
                }

                const force = 0.05
                let maxX = v(opts.max.x), maxY = v(opts.max.y), minX = v(opts.min.x), minY = v(opts.min.y)

                if (maxX !== undefined) {
                    moveX = opts.force.x === true && moveX > maxX ? (moveX - maxX) * force : Math.min(maxX, moveX);
                }
                if (maxY !== undefined) {
                    moveY = opts.force.y === true && moveY > maxY ? (moveY - maxY) * force : Math.min(maxY, moveY);
                }
                if (minX !== undefined) {
                    moveX = opts.force.x === true && moveX < minX ? minX - (minX - moveX) * force : Math.max(minX, moveX);
                }
                if (minY !== undefined) {
                    moveY = opts.force.y === true && moveY < minY ? minY - (minY - moveY) * force : Math.max(minY, moveY);
                }
            }

            const to = (x, y)=>{
                range(x - (oldX||0), y - (oldY||0));
                // console.log(moveX, moveY)
                fn.translate(moveX, moveY);
            }

            proto.move = to

            const move = (e)=>{

                let ev = e.touches ? e.touches[0] : e;
                // 计算拖动距离
                let distanceX = ev.pageX - beginX;
                let distanceY = ev.pageY - beginY;

                if(Math.abs(distanceX) > 10 || Math.abs(distanceY) > 10){
                    window.dragging = true
                }

                range(distanceX, distanceY);

                velocityX = (ev.pageX - endX) ;
                velocityY = (ev.pageY - endY) ;
                endX = ev.pageX;
                endY = ev.pageY;

                fn.translate(moveX, moveY)
                if(typeof opts.move == 'function') opts.move.call(el, {x:moveX, y:moveY,oldX,oldY, e:ev , fn:{reset} } )

            }

            const end = (e)=>{
                let ev = e.touches ? e.touches[0] : e;
                if(typeof opts.end == 'function' && !opts.inertia) opts.end.call(el, {x:moveX, y:moveY, e:ev} )
                opts.inertia && inertialScroll();//惯性滑动
                $(document).un('mouseup touchend',end);
                $(document).un('mousemove touchmove',move);
                setTimeout(()=>{
                    window.dragging = false
                })
            }

            /* 惯性滑动 */
            const inertialScroll = ()=>{
                let inertiaInterval = setInterval(function() {
                    moveX += velocityX;
                    moveY += velocityY;
                    range();
                    fn.translate(moveX, moveY);
                    velocityX *= 0.95;
                    velocityY *= 0.95;
                    if (Math.abs(velocityX) < 0.5 && Math.abs(velocityY) < 0.5) {
                        if(typeof opts.end == 'function') opts.end.call(el, {x:moveX, y:moveY} )
                        clearInterval(inertiaInterval);
                    }
                }, 16);
            }

            
            fn.on('mousedown touchstart',begin);
            return fn;

        },
        /* 
        scrollTo(x,y,ani)
        scrollTo(dom,ani);
        scrollTo(opts)
        */
        scrollTo(x,y,ani=false){
            let params = {};
            if(typeof x === 'object' && x.nodeType === 1){
                params = {
                    left: x.offsetLeft,
                    top: x.offsetTop,
                }
                if(y) params.behavior = 'smooth';
            }else if(typeof x === 'object'){
                params = x;
            }else{
                if(x) params.left = x;
                if(y) params.top = y;
                if(ani) params.behavior = 'smooth';
            }
            
            console.log(params)
            el.scrollTo(params)
        },
        $(selector){
            return $(el.querySelector(selector));
        },
        $$(selector){
            return $$(selector, el);
        },
    }

    proto._proto = proto;

    Object.setPrototypeOf(fn, proto);

    return fn;
}

const $$ = function(selector,parentSeletor){
    let parent = parentSeletor ? (typeof parentSeletor == 'object' ? parentSeletor : document.querySelector(selector)) : document;
    let els = parent.querySelectorAll(selector);
    let list = Array.from(els).map(item=>$(item));

    const fn = function(){}

    let proto = {
        each:callback=>els.forEach(callback),
        list:list,
        nodeList:els,
    };

    if(list.length){
        const item_proto = list[0]._proto;
        for(let name in item_proto){
            proto[name] = function(...args){
                list.forEach(item=>{
                    item[name].call(item, ...args);
                    
                })
                return fn;
            }
        }
    }
    Object.setPrototypeOf(fn,proto, list);
    return fn;
}

const $post = function(url,data){
    return fetch(url,{
        method:'post',
        headers:{
            'Content-Type':'application/json',
        },
        body:JSON.stringify(data),
    });
}

const $get = function(url,data={}){
    const searchParams = new URLSearchParams(data);
    const queryString = searchParams.toString();
    if(queryString){
        url = url.indexOf('?') > -1 ? url+'&'+queryString : url+'?'+queryString;
    }
    return fetch(url);
}

/* 随机生成ID */
const $id = function(len=8){
    return Number(Math.random().toString().substring(3,len) + Date.now()).toString(36)
}

const $jsonp = function(url,callbackKey='callback'){
    return new Promise((res,rej)=>{
        const callbackName = '_jsonp_' + $id();
        window[callbackName] = (data)=>{
            res(data);
        }
        url = url + (url.indexOf('?') > -1 ? '&' : '?') +callbackKey+ '=' + callbackName;
        $script(url,{delete:true}).catch(rej);
    });       
}

const $referrer = function(value = 'origin'){
    let dom = document.querySelector('meta[name="referrer"]');
    if(!dom){
        let head = document.querySelector('head');
        let referrerMeta = document.createElement('meta');
        referrerMeta.setAttribute('name','referrer');
        referrerMeta.setAttribute('content',value);
        head.appendChild(referrerMeta);    
        return;
    }else{
        dom.setAttribute('content',value);
    }    
}

const $script = function(url,opts={}){
    window._script_list = window._script_list || [];

    let urlList = typeof url == 'object' ? url : [url];
    let total = urlList.length;
    if( total < 1 ) return;
    let count = 0;
    let failed = false;

    const promise =  new Promise((res,rej)=>{

        const check = function(){
            count++;
            if(total == count){
                failed ? rej() : res();
            }
        }

        const add = function(scriptUrl,callback){
            //已加载过的忽略本次请求
            if(_script_list.indexOf(scriptUrl) > -1){
                check();
                typeof callback == 'function' && callback();
                return;
            }

            const script = document.createElement('script');
            if(typeof opts.props === 'object'){
                for(let key in opts.props){
                    script.setAttribute(key, opts.props[key]);
                }
            }
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

        const syncLoop = function(){
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
}

const $lockScroll = function(){
    const docEle = document.documentElement;
    docEle.style.marginRight = window.innerWidth - docEle.offsetWidth + 'px';
    docEle.style.overflow = 'hidden';
}

const $unLockScroll = function unLockScroll() {
    document.documentElement.removeAttribute('style');
}

const $ready = function(callback){
    const ready = function(){
        callback();
        $(document).un('DOMContentLoaded',ready);
    }
    $(document).on('DOMContentLoaded',ready);
}