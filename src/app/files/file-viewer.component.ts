import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Title,
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import { FileViewerService } from './file-viewer.service';
import { User, Attachment } from '../shared/models';
import {
  StringsService,
  AuthService,
  NotificationsService
} from '../shared/services';

@Component({
  selector: 'tb-file-viewer',
  templateUrl: './file-viewer.component.html'
})
export class FileViewerComponent implements OnInit, OnDestroy {
  private subs: any[];
  private fileHash: string;

  public strings: any;
  public pageName: string;
  public isLoaded: boolean;
  public fileUrl: SafeResourceUrl;

  public attachment: Attachment;
  public activeUser: User;

  constructor(private title: Title,
              private active: ActivatedRoute,
              private sanitizer: DomSanitizer,
              public service: FileViewerService,
              private notes: NotificationsService,
              private auth: AuthService,
              private stringsService: StringsService) {
    title.setTitle('TaskBoard - File Viewer');
    this.isLoaded = false;
    this.subs = [];

    let sub = this.stringsService.stringsChanged.subscribe(newStrings => {
      this.strings = newStrings;

      this.pageName = this.strings.files;
      this.title.setTitle(`TaskBoard - ${this.pageName}`);
    });
    this.subs.push(sub);

    sub = this.auth.userChanged.subscribe((user: User) => {
      this.activeUser = user;
    });
    this.subs.push(sub);

    sub = this.active.params.subscribe(params => {
      this.fileHash = params.hash;
    });
    this.subs.push(sub);
  }

  ngOnInit() {
    this.service.getAttachmentInfo(this.fileHash).subscribe(res => {
      res.alerts.forEach(note => this.notes.add(note));

      if (res.status === 'success') {
        this.attachment = res.data[1];

        const url = `./api/uploads/${this.attachment.diskfilename}`;
        this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

        this.isLoaded = true;
      }
    });
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}

