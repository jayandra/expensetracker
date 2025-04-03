// Parent has class: "accordion_parent" and ID: 'accordion_parent_<ID>'
// The toggle icon has class 'accordion_toggle_icon_' and its id in the form 'accordion_toggle_icon_<ID>'
// children wrapper has class 'accordion_children hidden' and id in the form 'accordion_children_<ID>'

// element opening all accordions has id of 'accordion_show_all'
// element opening all accordions has id of 'accordion_hide_all'
function toggleChildren(parentId) {
    const childrenContainer = document.getElementById(`accordion_children_${parentId}`);
    const toggleIcon = document.getElementById(`accordion_toggle_icon_${parentId}`);

    if (childrenContainer.classList.contains('hidden')) {
        childrenContainer.classList.remove('hidden');
        // toggleIcon.classList.add('transform', 'rotate-90');
        toggleIcon.textContent = '▼';
    } else {
        childrenContainer.classList.add('hidden');
        // toggleIcon.classList.remove('transform', 'rotate-90');
        toggleIcon.textContent = '▶';
    }
}

document.addEventListener("turbo:load", () => {
    let accordionParents = document.getElementsByClassName("accordion_parent");
    let accordionChildren = document.getElementsByClassName('accordion_children');
    let accordionIcons = document.getElementsByClassName('accordion_toggle_icon');

    for (let i = 0; i < accordionParents.length; i++) {
        let parent_id = accordionParents[i].id.split("_")[2];
        accordionParents[i].addEventListener('click', (e) => {
            toggleChildren(parent_id)
        })
    }

    document.getElementById("accordion_hide_all").addEventListener('click', (e) =>{
        Array.from(accordionChildren).forEach(element => element.classList.add('hidden'));
        Array.from(accordionIcons).forEach(element => element.textContent = '▶');
    })
    document.getElementById("accordion_show_all").addEventListener('click', (e) =>{
        Array.from(accordionChildren).forEach(element => element.classList.remove('hidden'));
        Array.from(accordionIcons).forEach(element => element.textContent = '▼');
    })
});