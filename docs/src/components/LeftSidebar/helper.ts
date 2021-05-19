import React from 'react';
import ArrowDown from '../../assets/svg/arrowDown.svg';
import ArrowForward from '../../assets/svg/arrowForward.svg';
import selectors from '../../constants/selectorsContant';
import ExternalLinkIcon from '../../assets/svg/externalLink.svg';

export const addExpandCollapseImages = (
    navContent: string,
    pageId: string,
    tabsClosed: { [key: string]: boolean },
) => {
    const nav = document.createElement('div');
    nav.innerHTML = navContent;
    nav.classList.add('navWrapper');

    nav.querySelectorAll('li').forEach((el, i) => {
        if (el.children.length === 2) {
            const paragraphElement = el.children[0];
            if (paragraphElement.childNodes.length < 2) {
                paragraphElement.classList.add('linkTitle');
                const text = (paragraphElement as HTMLParagraphElement)
                    .innerText;
                //Creating arrow icons to be added
                const spanElement = document.createElement('span');
                spanElement.classList.add('iconSpan');
                const imageElement = document.createElement('img');
                if (tabsClosed[text] === undefined || !tabsClosed[text]) {
                    imageElement.src = ArrowDown;
                } else {
                    imageElement.src = ArrowForward;
                    el.children[1].classList.add('displayNone');
                }

                //Checking if this div contains the active link
                const allLinks = el.children[1].querySelectorAll('a');
                for (let i = 0; i < allLinks.length; i++) {
                    const splitArr = allLinks[i].href.split('=');
                    if (splitArr.length > 1 && splitArr[1] === pageId) {
                        imageElement.src = ArrowDown;
                        el.children[1].classList.remove('displayNone');
                        break;
                    }
                }

                //Adding arrow icon to the p tags
                spanElement.appendChild(imageElement);
                paragraphElement.appendChild(spanElement);
            }
        }
    });

    nav.innerHTML = addExternalLinkIcon(nav.innerHTML);
    return nav.innerHTML;
};

export const collapseAndExpandLeftNav = (
    doc: HTMLDivElement,
    setLeftNavOpen: Function,
    toggleExpandOnTab: Function,
) => {
    //Adding click listener to close left nav when in mobile resolution
    doc.querySelectorAll(selectors.links).forEach((link) => {
        link.addEventListener('click', () => {
            setLeftNavOpen(false);
        });
    });

    doc.querySelectorAll('li').forEach((el, i) => {
        if (el.children.length === 2) {
            const spanElement =
                el.children[0].children.length === 2
                    ? el.children[0].children[1]
                    : el.children[0].children[0];
            if (spanElement) {
                //Adding click listener to the headings
                spanElement.addEventListener('click', () => {
                    const divElement = el.children[1];
                    toggleExpandOnTab(
                        (el.children[0] as HTMLParagraphElement).innerText,
                    );
                    divElement.classList.toggle('displayNone');
                    (spanElement
                        .children[0] as HTMLImageElement).src = divElement.classList.contains(
                        'displayNone',
                    )
                        ? ArrowForward
                        : ArrowDown;
                });
            }
        }
    });
};

export const getAllPageIds = (navContent: string): string[] => {
    const divElement = document.createElement('div');
    divElement.innerHTML = navContent;
    const allPageIds = [];
    divElement.querySelectorAll('a').forEach((link: HTMLAnchorElement) => {
        const splitArr = link.href.split('?');
        if (splitArr.length > 1) {
            const urlParams = new URLSearchParams(splitArr[1]);
            const pageId = urlParams.get('pageid');
            if (pageId) {
                allPageIds.push(pageId);
            }
        }
    });
    return allPageIds;
};

//Adding external icon to the external links
const addExternalLinkIcon = (navContent: string): string => {
    const divElement = document.createElement('div');
    divElement.innerHTML = navContent;
    divElement.querySelectorAll('a[target="_blank"]').forEach((link) => {
        const imgElement = document.createElement('img');
        imgElement.classList.add('externalLinkIcon');
        imgElement.src = ExternalLinkIcon;
        link.appendChild(imgElement);
    });
    return divElement.innerHTML;
};
