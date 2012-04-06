/* ============================================================
 * bootstrap-rowlink.js v2.0.2
 * http://jasny.github.com/bootstrap/javascript.html#rowlink
 * ============================================================
 * Copyright 2011 Jasny BV, Netherlands.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */

/* TODO: Turn this into a proper jquery plugin */

$(function () {
    $('*[data-rowlink]').each(function () {
        var target = $(this).attr('data-rowlink');
        
        (this.nodeName == 'tr' ? $(this) : $(this).find('tr:has(td)')).each(function() {
            var link = $(this).find(target).first();
            if (!link.length) return;
            
            var href = link.attr('href');

            $(this).find('td').not('.nohref').click(function() {
                window.location = href;
            });

            link.replaceWith(link.html());
        });
    });
})
