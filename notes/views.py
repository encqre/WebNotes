from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.urls import reverse
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import Entry, Update, Category, Profile, Log

from datetime import datetime
from calendar import month_name
import json

## Rendered pages

def auth(request):
    if request.method == 'POST':
        user = authenticate(request, username=request.POST.get('username'), password=request.POST.get('password'))
        if user is not None:
            login(request, user)
            return redirect('/notes/')
        else:
            return redirect('/?message=login_fail')
    else:
        return HttpResponse('You are not supposed to be here')

def my_login(request):
    if request.user.is_authenticated:
        return redirect('/notes/')
    else:
        if request.method == 'GET':
            get_message = request.GET.get("message")
            if get_message == None:
                return render(request, "notes/login.html")
            elif get_message == "login_fail":
                message = "Incorrect username or password"
                return render(request, "notes/login.html", {"message":message})
            elif get_message == "logout":
                message = "User was successfully logged out"
                return render(request, "notes/login.html", {"message":message})
            elif get_message == "no_auth":
                message = "You have to be logged in to view that"
                return render(request, "notes/login.html", {"message":message})
            else:
                return render(request, "notes/login.html")
        else:
            redirect('/')

def my_logout(request):
    logout(request)
    return redirect('/?message=logout')

def notes(request):
    if request.user.is_authenticated:
        active_entries = Entry.objects.filter(active=True).order_by('-last_updated')
        active_newest_ONE_updates = []
        active_newest_TWO_updates = []
        for entry in active_entries:
            latest_update = entry.update_set.order_by('-date')[0]
            if entry.category.name == "One":
                active_newest_ONE_updates.append(latest_update)
            elif entry.category.name == "Two":
                active_newest_TWO_updates.append(latest_update)
        return render(request, "notes/notes.html", {"ONE_updates":active_newest_ONE_updates, "TWO_updates":active_newest_TWO_updates})
    else:
        return redirect('/?message=no_auth')

def history(request):
    if request.user.is_authenticated:
        
        got_year = request.GET.get("year")
		current_year = datetime.now().year
		# current_year = 2024
		display_year_list = [current_year]
		if current_year > 2019:
			for year in reversed(range(2019,current_year)):
				display_year_list.append(year)
		got_month = request.GET.get("month")

		if got_year != None:
			got_year = int(str(got_year))

		if got_month != None:
			got_month = int(str(got_month))
		
		if got_month in range(1,13):
			month = got_month
		else:
			month = datetime.now().month

		if got_year in range (2019,2100):
			year = got_year
		else:
			year = current_year
            
        #all_logs = Log.objects.all().order_by("-date")
        month_logs = Log.objects.filter(date__month=month, date__year=year).order_by("-date")
        return render(request, "notes/history.html", {"logs":month_logs, "year":year, "month": month, "month_name":month_name[month], "current_year":current_year, "years":display_year_list})
    else:
        return redirect('/?message=no_auth')

def my_updates(request):
    if request.user.is_authenticated:
        user = User.objects.filter(username=request.user.username)[0]
        profile = Profile.objects.filter(user=user)[0]
        my_logs = Log.objects.filter(updater=profile).order_by("-date")
        return render(request, "notes/my_updates.html", {"logs":my_logs, "profile":profile})
    else:
        return redirect('/?message=no_auth')

## endpoints for AJAX calls

def remove(request):
    if request.method == 'POST':
        uuid = request.POST.get('uuid')
        update = Update.objects.filter(uuid=uuid)[0]
        entry = update.entry
        entry.active = False
        entry.save()
        
        user = User.objects.filter(username=request.user.username)[0]
		profile = Profile.objects.filter(user=user)[0]
		date = datetime.now()

		log_update(profile, update, "DEL", date=date)
        
        response_data = "Entry " + str(uuid) + " removed"
        return HttpResponse(
            json.dumps(response_data),
            content_type="application/json"
        )
    else:
        return HttpResponse("What are you doing here?")

def edit(request):
    if request.method == 'POST':
        uuid = request.POST.get('uuid')
        title = request.POST.get('title')
        content = request.POST.get('content')
        user = User.objects.filter(username=request.user.username)[0]
        profile = Profile.objects.filter(user=user)[0]
        date = datetime.now()

        old_update = Update.objects.filter(uuid=uuid)[0]
        entry = old_update.entry
        new_update = Update(title=title, content=content, entry=entry, date=datetime.now(), updater=profile)
        new_update.save()
        entry.last_updated = new_update.date
        entry.save()
        
        log_update(profile, new_update, "EDIT", date=date)
        
        response_data = {"status":"updated", "title":title, "content":content, "new_uuid":new_update.uuid, "updater":profile.short_name, "date":new_update.date}
        return HttpResponse(
            json.dumps(response_data, cls=DjangoJSONEncoder),
            content_type="application/json"
        )
    else:
        return HttpResponse("What are you doing here?")

def new(request):
    if request.method == 'POST':
        category = request.POST.get('category')
        uuid = request.POST.get('uuid')
        title = request.POST.get('title')
        content = request.POST.get('content')
        user = User.objects.filter(username=request.user.username)[0]
        profile = Profile.objects.filter(user=user)[0]
        date = datetime.now()

        if (category == "ONE"):
            categoryObject = Category.objects.filter(name="One")[0]
        elif (category == "TWO"):
            categoryObject = Category.objects.filter(name="Two")[0]
        entry = Entry(original_title=title, active=True, category=categoryObject, create_date=date, last_updated=date, created_by=profile)
        entry.save()
        update = Update(uuid=uuid, title=title, content=content, entry=entry, date=date, updater=profile)
        update.save()
        
        log_update(profile, update, "ADD", date=date)

        response_data = {"status": "created", "title":title, "content":content, "uuid":uuid, "updater":profile.short_name, "date":update.date}
        return HttpResponse(
            json.dumps(response_data, cls=DjangoJSONEncoder),
            content_type="application/json"
        )
    else:
        return HttpResponse("What are you doing here?")

def get_content(request):
    if request.method == 'POST':
        uuid = request.POST.get('uuid')
        update = Update.objects.filter(uuid=uuid)[0]
        response_data = {"title":update.title, "content":update.content}
        return HttpResponse(
                json.dumps(response_data),
                content_type="application/json"
            )
    else:
        return HttpResponse("What are you doing here?")
    
   
#MISC 

def log_update(profile, update, type, date=datetime.now()):
	dateString = str(date).split(".")[0]
	if type == "EDIT":
		message = str(dateString) + " - " + str(profile.full_name) + " updated existing entry"
	elif type == "ADD":
		message = str(dateString) + " - " + str(profile.full_name) + " added new entry"
	elif type == "DEL":
		message = str(dateString) + " - " + str(profile.full_name) + " deleted entry"
	new_log = Log(log=message , updater=profile, date=date, update=update, type=type)
	new_log.save()
